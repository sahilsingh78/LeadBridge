const express = require('express');
const multer = require('multer');
const { parseCsv } = require('../services/csvParser');
const { extractCrmRecords } = require('../services/aiExtractor');

const router = express.Router();

const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 5;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isCsv =
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.originalname.toLowerCase().endsWith('.csv');
    if (!isCsv) {
      return cb(new Error('Only .csv files are accepted.'));
    }
    cb(null, true);
  },
});

// POST /api/import — the only backend call the frontend makes, fired once
// the user clicks "Confirm" on the preview screen. Parses the CSV and runs
// AI extraction in one pass.
router.post('/import', (req, res, next) => {
  upload.single('file')(req, res, (multerErr) => {
    if (multerErr) {
      multerErr.statusCode = 400;
      return next(multerErr);
    }

    (async () => {
      if (!req.file) {
        const err = new Error('No file uploaded. Expected multipart field name "file".');
        err.statusCode = 400;
        throw err;
      }

      const csvContent = req.file.buffer.toString('utf-8');
      const { headers, rows } = parseCsv(csvContent);
      const result = await extractCrmRecords(rows);

      res.json({
        headers,
        totalRowsInFile: rows.length,
        ...result,
      });
    })().catch(next);
  });
});

module.exports = router;
