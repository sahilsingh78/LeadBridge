# LeadBridge

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Express.js](https://img.shields.io/badge/Backend-Express-green)
![Gemini](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-orange)
![Docker](https://img.shields.io/badge/Docker-Supported-blue)
![Tests](https://img.shields.io/badge/Tests-Jest-success)

**AI-powered CSV Lead Importer built for GrowEasy's Software Developer Assignment.**

Upload a CSV from **any source**—Facebook Lead Ads, Google Ads, Excel, another CRM, or a manually created spreadsheet—and LeadBridge intelligently maps it into GrowEasy's CRM schema using Gemini AI.

---

# 🌐 Live Demo

### Frontend

https://lead-bridge-theta.vercel.app/

### Backend

https://leadbridge-backend-bf5w.onrender.com

> **Note**
>
> The backend is deployed on Render's free tier.
> The first request after inactivity may take **30–50 seconds** while the server wakes up.

---

# ✨ Features

- Drag & Drop CSV Upload
- Client-side CSV Preview (No AI Calls)
- Intelligent AI Field Mapping
- Structured JSON Output
- Batch Processing
- Retry Mechanism
- Server-side Validation
- Imported vs Skipped Records Summary
- Responsive UI
- Docker Support
- Backend Unit Tests

---

# 📸 Screenshots

## Upload CSV

![Upload](docs/upload.png)

---

## CSV Preview

![Preview](docs/preview.png)

---

## AI Parsed Result

![Result](docs/result.png)

---

# 📖 Problem Statement

Every lead source exports CSVs differently.

Examples:

Facebook

```
Full Name
Phone
Email
```

Google Ads

```
Contact Name
Mobile Number
Email Address
```

Excel

```
Client
WhatsApp
Mail
```

Although these contain the same information, the column names differ.

LeadBridge uses Gemini AI to understand these variations and automatically map them into GrowEasy's standardized CRM schema.

---

# 🔄 Workflow

```
CSV Upload
      │
      ▼
Client-side Preview
      │
      ▼
Confirm Import
      │
      ▼
Express Backend
      │
      ▼
CSV Parsing
      │
      ▼
Gemini AI Mapping
      │
      ▼
Validation Layer
      │
      ▼
CRM Records
      │
      ▼
Frontend Result Table
```

---

# 🛠 Tech Stack

| Layer | Technology |
|--------|------------|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS |
| Backend | Node.js, Express |
| AI | Gemini 2.5 Flash |
| CSV Parsing | PapaParse |
| Testing | Jest |
| Deployment | Vercel + Render |
| Containerization | Docker |

---

# 📂 Project Structure

```
LeadBridge/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── Dockerfile
│   └── .env.local.example
│
├── sample-data/
├── docs/
└── docker-compose.yml
```

---

# 🚀 Running Locally

## Prerequisites

- Node.js 18+
- Gemini API Key

Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Runs on

```
http://localhost:4000
```

Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Runs on

```
http://localhost:3000
```

---

# 🔑 Environment Variables

Backend

```env
PORT=4000

GEMINI_API_KEY=your_key

GEMINI_MODEL=gemini-2.5-flash

BATCH_SIZE=25

BATCH_CONCURRENCY=2

MAX_RETRIES=3

FRONTEND_ORIGIN=http://localhost:3000
```

Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

# 📡 API

## POST

```
/api/import
```

Accepts

```
multipart/form-data
```

Returns

```json
{
  "imported":96,
  "skipped":4,
  "records":[]
}
```

---

# 🤖 CRM Extraction Rules

The backend enforces every assignment rule.

- Allowed crm_status values only
- Allowed data_source values only
- Date normalization
- Multiple email handling
- Multiple phone handling
- Skip invalid records
- Server-side validation after AI output

---

# ⚙️ Design Decisions

### Client-side Preview

The preview is generated entirely in the browser using PapaParse.

No AI request is made until the user clicks **Confirm**, matching the assignment requirements.

---

### AI Mapping

Gemini understands arbitrary column names and maps them into the fixed CRM schema.

Example

```
Customer Name

↓

name

WhatsApp

↓

mobile_without_country_code

Mail ID

↓

email
```

---

### Batch Processing

Rows are processed in batches of 25.

Benefits

- Lower token usage
- Faster retries
- Better scalability

---

### Retry Mechanism

Failed batches retry automatically using exponential backoff.

If a batch still fails, only that batch is skipped instead of failing the entire import.

---

### Validation Layer

Gemini output is never trusted blindly.

Every record is validated again on the backend before returning it.

---

# 🧪 Tests

Run backend tests

```bash
cd backend

npm test
```

---

# 🐳 Docker

```bash
GEMINI_API_KEY=your_key docker compose up --build
```

---

# 🚀 Deployment

Frontend

https://lead-bridge-theta.vercel.app/

Backend

https://leadbridge-backend-bf5w.onrender.com

---

# 🔮 Future Improvements

- Streaming CSV Parsing
- Progress Indicator
- Authentication
- Export to Excel
- Background Job Queue
- Database Support
- Audit Logs

---

# 👨‍💻 Author

**Sahil Singh**

GitHub

https://github.com/sahilsingh78

LinkedIn

https://linkedin.com/in/sahilbuilds

---

# 📄 License

MIT
