# LawyerGPT Frontend

This is the Next.js application for LawyerGPT. It provides the authenticated chat UI, document upload flow, streaming Gemini responses, RAG tool calls, Drizzle database access, and Unkey rate limiting.

For the full system overview, see the root `readme.md`.

## Getting Started

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Open `https://localhost:3000` in your browser. Development uses Next.js experimental HTTPS so the browser may ask you to trust a local certificate.

## Useful Scripts

- `pnpm dev`: run the local Next.js server.
- `pnpm build`: build the app.
- `pnpm lint`: format and check `src` with Biome.
- `pnpm db:generate`: generate Drizzle migrations.
- `pnpm db:migrate`: run local migrations.

## Key Paths

- `src/app/api/chat/[id]/route.ts`: streaming chat API route.
- `src/app/(app)/components/FileUpload.tsx`: document upload flow.
- `src/lib/ai`: Gemini client, model constants, prompts, embeddings, and retrieval.
- `src/lib/db`: Drizzle schema, migrations, and database client.

## Environment

Copy `.env.example` to `.env` and fill in the required values:

- `DATABASE_URL`
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_UPLOADER_URL`
- `NEXT_PUBLIC_API_KEY`
- `UNKEY_ROOT_KEY`
- `PRIMARY_MAIL_I`
- `PRIMARY_MAIL_II`

## Model Configuration

Model names live in `src/lib/ai/models.ts` so chat, title generation, and embeddings can be reviewed or upgraded in one place.
