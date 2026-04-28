# Gmail Task Dashboard

AI-powered task dashboard that reads your Gmail and surfaces actionable items — school deadlines, job application follow-ups, and general tasks — in a mobile-friendly web app.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Auth | NextAuth.js + Google OAuth |
| Gmail | Google Gmail API (read-only) |
| AI extraction | Claude API (`claude-sonnet-4-6`) |
| Database | Supabase (PostgreSQL) |
| Styling | Tailwind CSS |
| Deployment | Vercel |

## Project Structure

```
app/
  api/
    auth/[...nextauth]/   NextAuth handler (Google OAuth)
    gmail/sync/           POST — fetch emails, extract tasks via Claude, save to Supabase
    tasks/                GET (list+filter) / PATCH (update status)
  auth/signin/            Sign-in page
  dashboard/              Main task dashboard (client component)
components/
  dashboard/
    TaskCard.tsx          Single task card with priority/category display
    FilterBar.tsx         Category + status filters + Sync button
  SessionWrapper.tsx      NextAuth SessionProvider wrapper
lib/
  gmail.ts                Gmail API client — fetches and decodes emails
  claude.ts               Claude API — extracts tasks from email content
  supabase.ts             Browser Supabase client
  supabase-server.ts      Server-side Supabase client (cookie-based)
types/index.ts            Shared TypeScript types (Task, TaskCategory, etc.)
supabase/schema.sql       Database schema + RLS policies
```

## Setup (First Time)

### 1. Environment variables

Copy `.env.local` and fill in all values:

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

### 2. Google Cloud Console

1. Create a project at console.cloud.google.com
2. Enable **Gmail API**
3. Create OAuth 2.0 credentials (Web application)
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://your-app.vercel.app/api/auth/callback/google` (prod)
5. Add your email as a test user (while app is in testing mode)

### 3. Supabase

1. Create a project at supabase.com
2. Run `supabase/schema.sql` in the SQL editor
3. Copy the project URL and anon key into `.env.local`

### 4. Anthropic API

Get an API key from console.anthropic.com and add to `.env.local`.

### 5. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000` — sign in with Google, then hit **Sync Gmail**.

## Deploy to Vercel

```bash
npx vercel
```

Add all `.env.local` values as environment variables in Vercel project settings. Update `NEXTAUTH_URL` to your Vercel URL and add the production redirect URI in Google Cloud Console.

## How It Works

1. User signs in with Google OAuth — NextAuth stores the Gmail access token in the session.
2. On "Sync Gmail", the `/api/gmail/sync` route fetches the last 50 unread/recent emails.
3. Each email is sent to Claude with a prompt to extract tasks as structured JSON (title, category, priority, deadline).
4. Extracted tasks are saved to Supabase (deduped by `email_id + user_id`).
5. The dashboard fetches tasks from Supabase and displays them with filters.

## Task Categories

- **school** — assignments, deadlines, professor emails
- **job_application** — recruiter emails, interview requests, application confirmations
- **general** — everything else with an action item

## Key Files to Edit

- `lib/claude.ts` — tweak the extraction prompt to change how tasks are categorized/prioritized
- `components/dashboard/TaskCard.tsx` — change how tasks are displayed
- `app/api/gmail/sync/route.ts` — change how many emails are fetched or the Gmail query filter
