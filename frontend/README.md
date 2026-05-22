# LawyerGPT Frontend

This is the Next.js application for LawyerGPT. It provides the authenticated chat UI, document upload flow, streaming Gemini responses, RAG tool calls, Drizzle database access, and Unkey rate limiting.

For the full system overview, see the root `readme.md`.

## What Runs Here

- The App Router UI for signup/login, document upload, and conversations.
- The streaming chat API route at `src/app/api/chat/[id]/route.ts`.
- RAG query embedding and vector lookup in `src/lib/ai/embedding.ts`.
- Drizzle schema and migrations for users, conversations, messages, resources, and embeddings.
- Rate limiting for chat usage through Unkey.

The heavier document ingestion work lives in the Go API. The frontend uploads files to that API through `NEXT_PUBLIC_UPLOADER_URL`.

## Prerequisites

- Node.js 20 or newer.
- `pnpm`.
- A Postgres database reachable from `DATABASE_URL`.
- A Google Gemini API key.
- An Unkey root key.
- The Go API running locally if you want document uploads to work.

## Local Setup

```bash
cp .env.example .env
pnpm install
pnpm run dev
```

Open `https://localhost:3000` in your browser. Development uses Next.js experimental HTTPS so the browser may ask you to trust a local certificate.

For upload testing, start the Go API from the repo root:

```bash
make run
```

Then set `NEXT_PUBLIC_UPLOADER_URL` to the API base URL, usually `https://localhost`.

## Environment

Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL`: Postgres connection string used by Drizzle.
- `NODE_ENV`: `development`, `test`, or `production`.
- `GEMINI_API_KEY`: server-side Gemini key for chat, title generation, and embeddings.
- `NEXT_PUBLIC_UPLOADER_URL`: base URL for the Go API, for example `https://localhost`. The frontend appends `/upload`.
- `NEXT_PUBLIC_API_KEY`: browser-visible shared key sent to the Go API as `x-api-key`; it must match the API service's `x-api-key` env var.
- `UNKEY_ROOT_KEY`: server-side key for Unkey rate limiting.
- `PRIMARY_MAIL_I`: owner/admin email that bypasses chat limits.
- `PRIMARY_MAIL_II`: second owner/admin email that bypasses chat limits.

Do not commit `.env`. Only `.env.example` belongs in source control.

## Useful Scripts

- `pnpm dev`: run the local Next.js server.
- `pnpm build`: build the app.
- `pnpm lint`: format and check `src` with Biome.
- `pnpm lf`: run Biome autofixes on `src`.
- `pnpm db:generate`: generate Drizzle migrations.
- `pnpm db:migrate`: run local migrations.
- `pnpm db:studio`: open Drizzle Studio.

## Key Paths

- `src/app/api/chat/[id]/route.ts`: streaming chat API route.
- `src/app/(app)/components/FileUpload.tsx`: document upload flow.
- `src/app/(app)/components/ConversationsList.tsx`: signed-in user's recent conversations.
- `src/app/(auth)/actions/auth.ts`: signup, login, and logout server actions.
- `src/lib/ai`: Gemini client, model constants, prompts, embeddings, and retrieval.
- `src/lib/db`: Drizzle schema, migrations, and database client.

## Model Configuration

Model names live in `src/lib/ai/models.ts` so chat, title generation, and embeddings can be reviewed or upgraded in one place.

Current defaults:

- Chat: `gemini-3.1-flash-lite`
- Title generation: `gemini-3.1-flash-lite`
- Embeddings: `text-embedding-004`

## Database Notes

Drizzle owns the frontend-facing tables and migrations in `src/lib/db`. The Go API also writes resources and embeddings to Postgres, so use the same database connection when testing end-to-end ingestion and chat retrieval.

Typical local flow:

```bash
pnpm db:generate
pnpm db:migrate
pnpm run dev
```

## Verification

Before opening a PR, run:

```bash
pnpm exec biome check src
pnpm build
```

For a smaller docs or server-action change, a focused check is also useful:

```bash
pnpm exec biome check "src/app/(auth)/actions/auth.ts" "src/app/(app)/components/ConversationsList.tsx"
```

## Common Gotchas

- Use `https://localhost:3000`, not `http://localhost:3000`, because the dev script enables local HTTPS.
- If uploads return `401`, check that frontend `NEXT_PUBLIC_API_KEY` matches the API's `x-api-key`.
- If chat fails before streaming, check `GEMINI_API_KEY`, `DATABASE_URL`, and Unkey configuration.
- If retrieval returns weak context, confirm documents have been uploaded or ingested and that embeddings exist in the database.
