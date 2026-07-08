const { getModel } = require('../config/gemini');
const { buildBatchPrompt } = require('./promptBuilder');
const { sanitizeRecord } = require('./validator');

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE, 10) || 25;
const BATCH_CONCURRENCY = parseInt(process.env.BATCH_CONCURRENCY, 10) || 2;
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES, 10) || 3;

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calls Gemini for a single batch with exponential-backoff retry.
 * Throws only after all retries are exhausted — callers must handle that
 * by marking the whole batch as skipped rather than failing the request.
 */
async function callGeminiWithRetry(prompt, batchLabel) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const model = getModel();
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text);
    } catch (err) {
      lastError = err;
      console.warn(`[aiExtractor] ${batchLabel} attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`);
      if (attempt < MAX_RETRIES) {
        await sleep(2 ** attempt * 500); // 1s, 2s, 4s...
      }
    }
  }
  throw lastError;
}

/**
 * Processes one batch end-to-end: prompt -> AI call -> validate -> results.
 * Never throws for AI failures — a failed batch degrades to "all rows in
 * this batch skipped" so one bad batch can't sink the entire import.
 */
async function processBatch(rows, batchIndex) {
  const batchLabel = `batch ${batchIndex}`;
  const prompt = buildBatchPrompt(rows);

  let aiResponse;
  try {
    aiResponse = await callGeminiWithRetry(prompt, batchLabel);
  } catch (err) {
    return {
      imported: [],
      skipped: rows.map((_, i) => ({
        source_row_index: i,
        reason: `AI processing failed after ${MAX_RETRIES} attempts: ${err.message}`,
      })),
    };
  }

  const imported = [];
  const skipped = [];
  const seenIndices = new Set();

  for (const raw of aiResponse.imported || []) {
    const { record, skipReason } = sanitizeRecord(raw);
    seenIndices.add(raw.source_row_index);
    if (skipReason) {
      skipped.push({ source_row_index: raw.source_row_index, reason: skipReason });
    } else {
      imported.push(record);
    }
  }

  for (const item of aiResponse.skipped || []) {
    seenIndices.add(item.source_row_index);
    skipped.push(item);
  }

  // Defensive: if the model dropped a row entirely (didn't put it in either
  // array), don't silently lose data — surface it as skipped.
  rows.forEach((_, i) => {
    if (!seenIndices.has(i)) {
      skipped.push({ source_row_index: i, reason: 'row missing from AI response' });
    }
  });

  return { imported, skipped };
}

/**
 * Runs batches with limited concurrency so we don't blow through Gemini's
 * free-tier rate limits on large files, while still processing faster than
 * strictly sequential.
 */
async function runWithConcurrencyLimit(tasks, limit) {
  const results = new Array(tasks.length);
  let cursor = 0;

  async function worker() {
    while (cursor < tasks.length) {
      const current = cursor;
      cursor += 1;
      results[current] = await tasks[current]();
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, worker);
  await Promise.all(workers);
  return results;
}

/**
 * Main entry point: takes all parsed CSV rows and returns aggregated,
 * validated CRM records ready to send to the client.
 */
async function extractCrmRecords(rows) {
  const batches = chunk(rows, BATCH_SIZE);
  const tasks = batches.map((batch, i) => () => processBatch(batch, i));
  const batchResults = await runWithConcurrencyLimit(tasks, BATCH_CONCURRENCY);

  const imported = [];
  const skipped = [];
  for (const result of batchResults) {
    imported.push(...result.imported);
    skipped.push(...result.skipped);
  }

  return {
    imported,
    skipped,
    totalImported: imported.length,
    totalSkipped: skipped.length,
    totalProcessed: rows.length,
    batchCount: batches.length,
  };
}

module.exports = { extractCrmRecords };
