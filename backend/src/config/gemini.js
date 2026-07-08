const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  // Fail loudly at boot rather than on the first request — production
  // readiness means bad config surfaces immediately, not on a user's upload.
  console.warn(
    '[config] GEMINI_API_KEY is not set. AI extraction requests will fail until it is configured in .env'
  );
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

function getModel() {
  const { GEMINI_RESPONSE_SCHEMA } = require('./crmSchema');
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.1, // low temperature: this is an extraction task, not a creative one
      responseMimeType: 'application/json',
      responseSchema: GEMINI_RESPONSE_SCHEMA,
    },
  });
}

module.exports = { getModel };
