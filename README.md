# Profile Analyzer | RoastMyProfile AI

A hackathon MVP that roasts social media profiles and generates viral content ideas. Upload a screenshot, paste a profile URL, or drop a PDF/text file—get a grade, roast, and actionable viral ideas.

## Features

- **Image Upload** – Drag-and-drop or click to upload profile screenshots (Instagram, Twitter, LinkedIn, etc.)
- **URL Input** – Paste a profile URL (LinkedIn, Twitter/X, GitHub, etc.) to capture and analyze
- **File Upload** – Support for PDF, TXT, MD, and CSV files
- **AI Eye Overlay** – Framer Motion animations ("Analyzing Bio...", "Detecting Cringe...") during analysis
- **Streaming Roast** – Word-by-word roast streamed in real time
- **Profile Grade** – A–F score with color-coded Result Card
- **Viral Ideas** – 3–5 content hooks tailored to the profile
- **Burn Card** – Shareable holofoil-style card (Grade + best roast line) via html-to-image

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | Vite, React, TypeScript, Tailwind, Shadcn/UI, Framer Motion, Lucide |
| Backend | Hono, Node.js (tsx), Vercel AI SDK |
| AI | OpenAI GPT-4o (Vision + text) |
| Screenshots | Puppeteer (headless Chrome) |
| Documents | pdf-parse |

## Prerequisites

- Node.js 18+
- OpenAI API key

## Installation

```bash
git clone <repo-url>
cd profile-analyzer
npm install
cd backend && npm install
cd ../frontend && npm install
```

## Environment

Copy `.env.example` to `.env` in the project root (or in `backend/` if you run the backend directly):

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Your OpenAI API key (required) |
| `OPENAI_MODEL` | Model to use (default: `gpt-4o-mini`) |
| `PORT` | Backend port (default: `3001`) |

## Development

Run backend and frontend in separate terminals:

```bash
# Terminal 1 – Backend (port 3001)
npm run dev:backend

# Terminal 2 – Frontend (port 5173)
npm run dev:frontend
```

Open [http://localhost:5173](http://localhost:5173). The Vite dev server proxies `/api` to the backend.

## Production

```bash
npm run build
npm run start
```

The backend serves the built frontend from `frontend/dist`. One process, one deploy.

## API

### `POST /api/analyze`

Accepts profile content and streams grade, viral ideas, and roast.

**JSON body options:**

| Field | Type | Description |
|-------|------|-------------|
| `image` | string | Base64 data URL (e.g. `data:image/png;base64,...`) |
| `url` | string | Profile URL to screenshot (LinkedIn, Twitter, etc.) |
| `text` | string | Raw profile/bio text |
| `file` | string | Base64-encoded file content |
| `mimeType` | string | Required with `file` (e.g. `application/pdf`) |
| `filename` | string | Optional filename with `file` |

**Multipart form:**

- `file` or `image` – Image (PNG, JPEG, etc.) or document (PDF, TXT, MD, CSV)

**Example (text):**

```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"Founder | Builder | Prev: Google, Meta."}'
```

**Example (image file):**

```bash
curl -X POST http://localhost:3001/api/analyze \
  -F "image=@screenshot.png"
```

## Project Structure

```
profile-analyzer/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Hono app, CORS, static serve
│   │   ├── routes/
│   │   │   └── analyze.ts    # POST /api/analyze
│   │   └── lib/
│   │       ├── prompts.ts    # System prompts
│   │       ├── screenshot.ts # Puppeteer URL capture
│   │       └── extractText.ts # PDF/text extraction
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/       # ScanZone, ResultCard, BurnCard, etc.
│   │   ├── hooks/            # useProfileAnalysis
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
├── .env.example
├── package.json
└── README.md
```

## Deployment

Deploy to Railway, Render, Fly.io, or similar. Ensure:

- `OPENAI_API_KEY` is set
- Puppeteer/Chromium is available (Railway/Render provide buildpacks)
- `npm run build` then `npm run start` for production

## License

ISC
