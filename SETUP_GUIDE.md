# Falcon Driving Academy - Authentication & Integration Setup Guide

## Quick Start

### 1. **Local Testing (Development Mode)**
The app includes **local fallback authentication** that works without Supabase:
- Users are stored in browser localStorage
- Default test user: `amina@example.com` / `password123`
- No Paystack keys required to test booking flow (uses public key testing mode)

**To run locally:**
```bash
npm install
npm run dev
```
Visit: http://localhost:3000

### 2. **Production Setup**

You need to configure three services:

---

## Service 1: Supabase (Authentication & Database)

### What it does:
- Stores user profiles securely
- Manages authentication across devices
- Syncs bookings to a database
- Replaces the browser-only localStorage

### Setup steps:

1. **Create a Supabase project**
   - Go to https://supabase.com and sign up (free tier available)
   - Create a new project
   - Wait for it to initialize (~2 minutes)

2. **Get your credentials**
   - Project Settings → API
   - Copy **Project URL** and save to `VITE_SUPABASE_URL` in `.env`
   - Copy **anon public key** and save to `VITE_SUPABASE_ANON_KEY` in `.env`
   - (Optional but recommended) Create a **Service Role Key** and save it to `SUPABASE_SERVICE_ROLE_KEY` in your server `.env` for trusted server-side operations (upserts, inserts, admin tasks). Keep this key secret and do not expose it to the client.

3. **Create database tables** (in Supabase SQL Editor):
   ```sql
   -- Users table (created automatically by Supabase Auth)
   -- Supabase will auto-create this when you enable Auth
   
   -- Bookings table (for storing payment records)
   CREATE TABLE bookings (
     id TEXT PRIMARY KEY,
     full_name TEXT NOT NULL,
     phone TEXT NOT NULL,
     email TEXT NOT NULL,
     course_id TEXT NOT NULL,
     schedule TEXT NOT NULL,
     notes TEXT,
     reference TEXT UNIQUE NOT NULL,
     amount INTEGER NOT NULL,
     status TEXT DEFAULT 'paid',
     created_at TIMESTAMP DEFAULT NOW(),
     paid_at TIMESTAMP DEFAULT NOW()
   );

   -- Create indexes for faster queries
   CREATE INDEX idx_email ON bookings(email);
   CREATE INDEX idx_reference ON bookings(reference);
   ```

4. **Enable Row Level Security (RLS)** (optional but recommended):
   - Tables → bookings → RLS
   - Enable RLS
   - Add policy to allow users to view/insert their own bookings

### Test in Supabase mode:
- Update `.env` with your Supabase credentials
- Restart dev server
- Try sign-up/login
- Check Supabase Dashboard for new users

---

## Service 2: Paystack (Payment Processing)

### What it does:
- Processes driving course payments
- Generates secure payment URLs
- Verifies transactions after payment

### Setup steps:

1. **Create Paystack account**
   - Go to https://paystack.com and sign up
   - Verify email and complete onboarding
   - Use **Test Mode** during development

2. **Get your API keys**
   - Dashboard → Settings → Developers
   - Copy **Public Key** (starts with `pk_test_`) → `.env` as `VITE_PAYSTACK_PUBLIC_KEY`
   - Copy **Secret Key** (starts with `sk_test_`) → `.env` as `PAYSTACK_SECRET_KEY` ⚠️ **KEEP SECRET**

3. **Paystack credentials in `.env`:**
   ```
   VITE_PAYSTACK_PUBLIC_KEY="pk_test_xxxxxxxxxxxxxxxxxxxxxxxx"
   PAYSTACK_SECRET_KEY="sk_test_xxxxxxxxxxxxxxxxxxxxxxxx"
   ```

4. **Important: Public vs Secret Keys**
   - `VITE_` prefix = exposed to browser (safe for public keys)
   - NO `VITE_` prefix = backend only (secret keys stay safe)
   - Never put `sk_test_` or `sk_live_` in frontend code

### Payment Flow:
1. User enters course + amount on booking page
2. Frontend sends to `/api/payment/initialize`
3. Backend verifies amount and creates Paystack charge
4. User redirected to Paystack checkout
5. After payment, Paystack redirects to `/api/payment/callback`
6. Backend verifies transaction with Paystack API
7. Booking saved to database if verified

### Test payment cards (Paystack):
- Card: 4111 1111 1111 1111
- Expiry: Any future date (e.g., 05/25)
- CVV: Any 3 digits (e.g., 123)

---

## Service 3: Authentication System

### How it works:

**Local Mode (No Supabase):**
- SignUp: Creates user in localStorage, auto-logged in
- SignIn: Checks localStorage for matching credentials
- Verification: Code `123456` works for all emails in dev mode
- No backend required

**Production Mode (Supabase Enabled):**
- SignUp: Creates in both localStorage (fallback) and Supabase Auth
- SignIn: Checks Supabase Auth first, falls back to local
- Verification: Supabase sends real email confirmations
- Persistent across devices

### Sign-In Endpoints:
```
GET  /auth/pages/Auth.tsx  - Login/Signup UI
POST /api/payment/initialize - Initiate booking payment
GET  /api/payment/callback - Paystack redirect after payment
GET  /api/payment/verify-status - Check if payment was verified
```

### Test Users:
- **Email:** amina@example.com
- **Password:** password123
- **Verification Code:** 123456 (in dev mode)

---

## Environment Variables Reference

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `VITE_SUPABASE_URL` | Optional | `https://abc123.supabase.co` | Database URL - omit for local-only |
| `VITE_SUPABASE_ANON_KEY` | Optional | `eyJhbGc...` | Frontend auth key - shared publicly |
| `VITE_PAYSTACK_PUBLIC_KEY` | Yes (for payments) | `pk_test_abc123...` | Public, safe to expose |
| `PAYSTACK_SECRET_KEY` | Yes (for payments) | `sk_test_abc123...` | ⚠️ **SECRET - never expose** |
| `APP_URL` | Optional | `http://localhost:3000` | For Paystack redirects |
| `GEMINI_API_KEY` | Optional | `AIza...` | For AI features |

---

## Deployment Checklist

### Before deploying to production:

- [ ] Switch Paystack to **live mode** (get live keys: `pk_live_`, `sk_live_`)
- [ ] Update `.env.production` with live Paystack keys
- [ ] Test payment flow end-to-end with small amount
- [ ] Create Supabase backups
- [ ] Set up email notifications for new bookings
- [ ] Add error monitoring (e.g., Sentry)
- [ ] Enable HTTPS (required for Paystack)
- [ ] Test on mobile devices
- [ ] Verify confirmation emails work

### Deployment platforms:
- **Vercel** (recommended for Next.js/React)
- **Netlify** (for static frontend + serverless functions)
- **Railway** / **Render** (for Node.js backend)
- **DigitalOcean** (for full control)

---

## Troubleshooting

### "Missing Paystack secret key" error
- Add `PAYSTACK_SECRET_KEY` to `.env`
- Restart dev server: `npm run dev`
- Check key starts with `sk_test_` or `sk_live_`

### Supabase login not working
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`
- Check Supabase project is active (not paused)
- Try logging out and back in
- Check browser console for errors (F12)

### Payment not verifying
- Confirm `PAYSTACK_SECRET_KEY` is correct
- Check Paystack dashboard for transaction record
- Verify callback URL in Paystack settings points to `/api/payment/callback`
- Test with Paystack test cards first

### Bookings not saving
- If Supabase: Check table has RLS policies allowing inserts
- If localStorage: Check browser storage isn't full
- Try incognito window to test

---

## Security Notes

- ✅ Keep `.env` files out of git (already in `.gitignore`)
- ✅ Use test keys during development
- ✅ Rotate keys if accidentally exposed
- ✅ Use `HTTPS` in production
- ✅ Enable Supabase RLS for bookings table
- ✅ Never share `sk_` keys publicly
- ✅ Validate all payments server-side

---

## Support

For issues:
1. Check browser console (F12 → Console tab)
2. Check server terminal for error messages
3. Verify all `.env` variables are set correctly
4. Check Supabase/Paystack dashboards for account status

