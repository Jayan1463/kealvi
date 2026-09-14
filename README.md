# Kealvi

A live polling workspace built with Next.js, React, and Supabase.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000. For a production build, run `npm run build`, then `npm start`.

Development and builds use Next.js’s supported Webpack mode because Turbopack worker port binding is restricted in this environment. Google Fonts access is needed on an uncached build.

The existing `.env.local` is used automatically. On a fresh checkout, copy `.env.local.example` to `.env.local`, add your Supabase project URL and server-only service role key, and run `supabase/schema.sql` in that project's SQL editor. Never commit credentials. Without Supabase credentials the workspace displays read-only sample data.

## Features

- Create categorized polls with 2–8 distinct options and optional deadlines.
- Start from team check-in, feature priority, or session feedback templates; edit before publishing.
- Vote, optionally change a vote, and close polls created in this browser.
- Results refresh every 15 seconds and after a vote or publication.
- Search by question, category, or creator; filter by status and sort by popularity or deadline.
- Browse All polls, My polls, Voted, and Saved collections.
- Save bookmarks across reloads in the same browser.
- Copy a direct poll link that opens the poll room focused on that poll.
- Download a poll's results, or all filtered results, as JSON with export time, option counts, and percentages. Exports omit browser identities.
- Overview metrics, category insights, contributor leaderboard, and activity alerts.
- Responsive desktop/mobile layouts, including mobile display-name editing.
- Form validation, request failure messages, and a retry screen for workspace loading failures.
- Optional Gemini poll drafts: add `GEMINI_API_KEY` and a supported `GEMINI_MODEL` to `.env.local`, then restart. This checkout has no Gemini key configured; manual creation and templates work without it.

Identities and saved polls belong to this browser; there is no account sign-in or cross-device bookmark sync. The workspace currently loads the newest 100 polls. Supabase tables use RLS and the browser calls server Route Handlers.

## Verification and screenshots

```sh
npm run lint
npm run build
# With the local server running and Google Chrome installed:
npm run verify:features
```

The browser verification creates a clearly labeled `Workspace verification` poll in the configured database, tests creation/voting/vote changes/bookmarks/sharing/downloads/closing and desktop/mobile screens, then closes the test poll. It never deletes existing polls. Every run leaves its closed test poll for traceability.

Screenshots are in [`screenshots/`](screenshots/), with an index in [`screenshots/README.md`](screenshots/README.md). `results-example.json` is a real downloaded results file. To check another local port, set `BASE_URL`, for example `BASE_URL=http://localhost:3001 npm run verify:features`.
