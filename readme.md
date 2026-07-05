# LawyerGPT

LawyerGPT is a full-stack legal research assistant for Nigerian law. It combines a Next.js chat interface, a Go ingestion API, PostgreSQL vector search, and Google Gemini models to let users upload legal documents, generate embeddings, and ask context-aware questions over the resulting knowledge base.

The project is currently paused because of hosted model and infrastructure costs, but the codebase demonstrates the core product architecture for retrieval-augmented legal AI: document parsing, OCR fallback, embeddings, vector retrieval, tool-calling chat, rate limiting, and HTTPS local development.

> Illustrations by Popsy.co

## Highlights

- **RAG legal chat**: streams answers through the [Vercel AI SDK](https://sdk.vercel.ai/docs/introduction), using Gemini 3.1 Flash-Lite for cost-sensitive legal Q&A.
- **Document ingestion**: accepts PDF, DOCX, and image uploads, extracts text, chunks content, and stores embeddings for retrieval.
- **Nigerian law focus**: ships with prompts, seed ingestion utilities, and sample court judgment sources geared toward Nigerian legal research.
- **Go processing layer**: keeps file parsing, OCR, embedding generation, and bulk text ingestion outside the web app.
- **Vector search**: stores document chunks in PostgreSQL with `pgvector` for semantic retrieval during conversations.
- **Operational guardrails**: uses Unkey rate limiting, Caddy HTTPS, Docker Compose, Drizzle migrations, Biome, and GitHub Actions.

## Architecture

```bash
.
├── api/        # Go HTTP API for uploads, parsing, OCR, embeddings, and persistence
├── extractor/  # Optional Go CLI for scraping source URLs into the API
├── frontend/   # Next.js app, chat UI, auth, RAG tools, and database access
├── makefile    # Root development tasks for API, extractor, migrations, and formatting
└── readme.md
```

### Frontend

The frontend is a Next.js app styled with Tailwind CSS. It handles authentication, conversations, uploads, rate limits, and the streaming chat route. The chat route calls a retrieval tool that embeds the user's question, searches relevant legal document chunks, and gives the result back to Gemini before streaming the answer.

Key pieces:

- `frontend/src/app/api/chat/[id]/route.ts` streams RAG chat responses.
- `frontend/src/lib/ai/embedding.ts` generates query embeddings and retrieves similar chunks.
- `frontend/src/lib/ai/models.ts` centralizes model names for chat, title generation, and embeddings.
- `frontend/src/lib/db` contains Drizzle schema, migrations, and database access.

### Go API

The API is a Go HTTP service that receives file uploads from the frontend and text batches from the extractor. It parses PDFs and DOCX files, falls back to OCR for scanned PDFs and images, chunks extracted content, generates Gemini embeddings, and persists resources plus vectors in Postgres.

Endpoints:

- `POST /upload`: accepts multipart document uploads from the frontend.
- `POST /text-embeddings`: accepts scraped text batches from the extractor.

The API is normally run with Docker Compose and Caddy through `make run`.

### Extractor

The extractor is not called by the frontend at runtime. It is a standalone Go CLI for one-off or repeatable corpus ingestion. When run, it scrapes configured source URLs, extracts text from the configured CSS selector, batches the results, and posts them to the API's `/text-embeddings` endpoint with the shared API key.

By default it includes a small set of NigerianLII judgment URLs. For broader use, configure `EXTRACTOR_URLS` and `EXTRACTOR_SELECTOR` in `extractor/.env.development`.

## Running Locally

### 1. Frontend

```bash
cd frontend
cp .env.example .env
pnpm install
pnpm run dev
```

The app runs at `https://localhost:3000` because local development uses Next.js experimental HTTPS.

Required services and keys:

- `DATABASE_URL`: Postgres connection string used by Drizzle.
- `GEMINI_API_KEY`: Google Gemini API key.
- `UNKEY_ROOT_KEY`: Unkey key for rate limiting.
- `NEXT_PUBLIC_UPLOADER_URL`: API upload URL.
- `NEXT_PUBLIC_API_KEY`: shared API key sent to the Go API.

### 2. API

```bash
cd api
cp .env.example .env.development
cd ..
make run
```

The API runs behind Caddy at `https://localhost`. The first browser request may show a self-signed certificate warning, which is expected for local HTTPS.

### 3. Extractor

Start the API first, then configure and run the extractor:

```bash
cd extractor
cp .env.example .env.development
cd ..
make build-extractor
```

Relevant extractor environment variables:

- `BASE_URL`: API base URL, for example `https://localhost`.
- `API_KEY`: shared key sent as the `x-api-key` header.
- `EXTRACTOR_URLS`: optional comma-separated or newline-separated source URLs.
- `EXTRACTOR_SELECTOR`: optional CSS selector for the main content area.

## Why This Matters

LawyerGPT explores how legal AI products can be adapted to local legal systems rather than only generic common-law examples. The architecture is intentionally practical: a React product surface, a Go ingestion pipeline for heavy document processing, vector search for grounded answers, and model/provider boundaries that can be swapped as costs and model quality change.

## Security Note

Local HTTPS uses a self-signed certificate for development convenience. Production deployments should use a certificate issued by a trusted certificate authority and should keep all API keys, database credentials, and rate-limit keys out of source control.

## Harvey Elite Upgrade
This repository includes a /.harvey hardening profile for secure legal document parsing, case research, and compliance workflows.
Key files:
- .harvey/HARVEY_ELITE_PROFILE.yaml
- .harvey/COMPLIANCE_CONTROLS.md
- .harvey/CONNECTORS.json

Additional automation files:
- .harvey/full_automation.sh
- .harvey/PACER.env.example
- .harvey/LEGAL_RESEARCH.env.example
- .harvey/LEGAL_CASE_WATCHLIST.yaml
- .harvey/MCP_SERVER_CONFIG.example.json
- .harvey/GITHUB_ACTIONS_AUTOMATION_TEMPLATE.yml
