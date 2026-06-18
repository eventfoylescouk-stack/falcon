# Falcon Driving School

React + Vite frontend for Falcon Driving School in Wuye, Abuja, with a custom Express API that uses Supabase as the primary backend database for bookings and contact messages.

## Supabase setup

1. Create a Supabase project at <https://supabase.com>.
2. Open the project dashboard, then go to **SQL Editor**.
3. Paste and run the SQL from `supabase/schema.sql`. This creates the `bookings` and `contacts` tables.
4. Go to **Project Settings → API**.
5. Copy your **Project URL** into `SUPABASE_URL`.
6. Copy your **service_role** key into `SUPABASE_SERVICE_ROLE_KEY`.
   - Keep this key server-side only.
   - Do not expose it as a `VITE_` variable.
7. Add your Paystack keys:
   - `VITE_PAYSTACK_PUBLIC_KEY` is used by the browser checkout.
   - `PAYSTACK_SECRET_KEY` is used by the backend to verify payment references.

## Environment setup

Copy `.env.example` to `.env.local` for frontend variables and `.env` for backend variables, or set the variables in your host dashboard.

Required variables:

```bash
VITE_PAYSTACK_PUBLIC_KEY="pk_test_your_paystack_public_key"
PAYSTACK_SECRET_KEY="sk_test_your_paystack_secret_key"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
```

Optional variables:

```bash
PORT="4000"
VITE_API_BASE_URL=""
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

- `GET /api/health` returns backend health status and whether Supabase env vars are configured.
- `GET /api/courses` returns the course catalog used by the app.
- `POST /api/bookings` verifies the Paystack reference when `PAYSTACK_SECRET_KEY` is set, then stores the paid booking in Supabase.
- `POST /api/contacts` stores contact form submissions in Supabase.

The backend uses the Supabase REST API with the service-role key. This keeps privileged database writes on the server instead of exposing Supabase credentials in the browser.
