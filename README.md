# Kealvi Pulse

A live polling workspace built with Next.js 16, React 19, and Supabase.

## Features

- Create categorized polls with 2-8 options and optional deadlines
- Prevent duplicate votes and optionally allow vote changes
- Close creator-owned polls
- Search, status filters, and popularity/deadline sorting
- Overview metrics, category insights, leaderboard, and activity alerts
- Responsive dashboard with a read-only demo mode when Supabase is not configured

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Copy `.env.local.example` to `.env.local`.
4. Add the project URL and service role key. The key stays server-side.
5. Run `npm run dev`.

The browser only calls Next.js Route Handlers. Direct public table access remains
blocked by RLS.
