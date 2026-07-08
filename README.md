# GrowEasy — AI-Powered CSV Lead Importer

Upload a CSV from **any** source (Facebook Lead Ads, Google Ads, Excel, another CRM,
a hand-made spreadsheet) and get it mapped into GrowEasy's fixed CRM schema — no
matter what the original column names are.

## How it works

1. **Upload** — drag & drop or pick a `.csv` file.
2. **Preview** — the file is parsed and shown in a table client-side. No AI call happens yet.
3. **Confirm** — clicking Confirm sends the raw CSV to the backend.
4. **AI Mapping** — the backend batches the rows (25/batch) and asks Gemini to map
   whatever columns exist onto the CRM schema, enforcing the enum/skip rules from
   the spec via both prompt constraints and server-side validation.
5. **Result** — imported vs. skipped records, with reasons for anything skipped.

## Project structure

```
groweasy-csv-importer/
├── backend/                 Express API
│   ├── src/
│   │   ├── config/           CRM schema/enums + Gemini client setup
│   │   ├── services/         csvParser, promptBuilder, aiExtractor, validator
│   │   ├── routes/           POST /api/import
│   │   ├── middleware/       centralized error handler
│   │   └── server.js
│   ├── .env.example
│   └── Dockerfile
├── frontend/                 Next.js app
│   ├── app/                   page.tsx (4-step flow), layout.tsx, globals.css
│   ├── components/            UploadDropzone, DataTable, ProcessingPipeline, StepRail, StatusPill
│   ├── lib/                   csvClientParse, api, types
│   ├── .env.local.example
│   └── Dockerfile
└── docker-compose.yml
```

## Prerequisites

- Node.js 18+
- A free Gemini API key: https://aistudio.google.com/app/apikey

## Run locally (no Docker)

**Terminal 1 — backend:**
```
cd backend
npm install
copy .env.example .env
```
Open `.env` and paste your Gemini key into `GEMINI_API_KEY=`. Then:
```
npm run dev
```
Backend runs on http://localhost:4000

**Terminal 2 — frontend:**
```
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```
Frontend runs on http://localhost:3000

## Run with Docker

```
set GEMINI_API_KEY=your_key_here
docker compose up --build
```

## Tests

```
cd backend
npm test
```

## Deployment

- **Backend → Railway**: new project from repo, root directory `backend`, add
  `GEMINI_API_KEY` env var, Railway auto-detects the start command.
- **Frontend → Vercel**: new project from repo, root directory `frontend`, add
  `NEXT_PUBLIC_API_URL` env var pointing to your deployed Railway URL.

## Design notes

- **Batching + retries**: rows are chunked (`BATCH_SIZE=25`), processed with
  limited concurrency (`BATCH_CONCURRENCY=2`), and each batch retries up to
  `MAX_RETRIES=3` times with exponential backoff before degrading to "skipped"
  rather than failing the whole import.
- **Two-layer validation**: enum constraints and skip rules are enforced both
  in the Gemini prompt/schema *and* redundantly re-checked server-side in
  `validator.js`, since LLM output should never be trusted blindly even with
  structured output mode.
- **No AI on preview**: the preview table is parsed entirely client-side
  (PapaParse) so Step 2 genuinely does zero AI processing, matching the spec.
