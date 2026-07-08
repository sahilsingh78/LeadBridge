require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const importRoute = require('./routes/import');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || '*',
  })
);
app.use(express.json());

// Rate limit the import endpoint specifically — it's the expensive one
// (triggers batched LLM calls), so it needs its own guard rail separate
// from any future lightweight endpoints.
const importLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many import requests, please try again later.' },
});
app.use('/api/import', importLimiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', importRoute);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`GrowEasy CSV Importer backend running on port ${PORT}`);
});
