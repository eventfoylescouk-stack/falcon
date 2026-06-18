# Falcon Driving School

React + Vite frontend for Falcon Driving School in Wuye, Abuja, with a custom Express backend for course data, contact messages, and paid booking submissions. The backend can persist to Supabase when configured, or to local JSON files for development.

## Prerequisites

- Node.js 22+
- npm
- Paystack public and secret keys for live payment collection and verification

## Environment setup

Copy `.env.example` to `.env.local` for local frontend variables and/or `.env` for backend variables.

Required payment variables:

```bash
VITE_PAYSTACK_PUBLIC_KEY="pk_test_your_paystack_public_key"
PAYSTACK_SECRET_KEY="sk_test_your_paystack_secret_key"
```

Optional backend variables:

```bash
PORT="4000"
DATA_DIR="./server/data"
VITE_API_BASE_URL=""
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
```

Use `VITE_API_BASE_URL` only when the frontend is hosted separately from the backend, for example `http://localhost:4000` while running Vite on port 3000.

## Run locally

Install dependencies:

```bash
npm install
```

Run the frontend only:

```bash
npm run dev
```

Run the backend API:

```bash
npm run dev:backend
```

Build the frontend and serve it through the backend:

```bash
npm run build
npm start
```

## Backend API

- `GET /api/health` returns backend health status.
- `GET /api/courses` returns the course catalog used by the app.
- `POST /api/bookings` stores a paid booking after Paystack checkout. If `PAYSTACK_SECRET_KEY` is configured, the backend verifies the Paystack reference before saving the booking record.
- `POST /api/contacts` stores contact form submissions.

By default, records are stored as JSON files in `DATA_DIR` so the site has a working custom backend without adding a database service yet. If `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured, the same backend writes to Supabase instead. Run `supabase/schema.sql` in the Supabase SQL editor before enabling Supabase storage. The default `server/data/` folder is git-ignored.
