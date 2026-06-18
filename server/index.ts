import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { COURSES } from '../src/data';
import type { BookingSubmission, ContactSubmission } from '../src/types';

interface StoredBooking extends BookingSubmission {
  id: string;
  courseName: string;
  amount: number;
  paymentVerified: boolean;
  createdAt: string;
}

interface StoredContact extends ContactSubmission {
  id: string;
  createdAt: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 4000);
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const distDir = path.resolve(__dirname, '../dist');

app.use(express.json({ limit: '1mb' }));

function getSupabaseConfig() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the backend.');
  }

  return { supabaseUrl, supabaseServiceRoleKey };
}

async function insertSupabaseRecord(table: 'bookings' | 'contacts', record: Record<string, unknown>) {
  const config = getSupabaseConfig();
  const response = await fetch(`${config.supabaseUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Supabase insert failed for ${table}: ${errorBody}`);
  }
}

async function persistBooking(booking: StoredBooking) {
  await insertSupabaseRecord('bookings', {
    id: booking.id,
    full_name: booking.fullName,
    phone: booking.phone,
    email: booking.email ?? null,
    course_id: booking.courseId,
    course_name: booking.courseName,
    amount: booking.amount,
    schedule: booking.schedule,
    notes: booking.notes ?? null,
    payment_reference: booking.paymentReference,
    payment_verified: booking.paymentVerified,
    created_at: booking.createdAt,
  });
}

async function persistContact(contact: StoredContact) {
  await insertSupabaseRecord('contacts', {
    id: contact.id,
    name: contact.name,
    email: contact.email,
    message: contact.message,
    created_at: contact.createdAt,
  });
}

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

async function verifyPaystackReference(reference: string) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return false;
  }

  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  });

  if (!response.ok) {
    throw new Error('Unable to verify Paystack payment reference.');
  }

  const result = await response.json() as { status?: boolean; data?: { status?: string } };
  return Boolean(result.status && result.data?.status === 'success');
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'falcon-backend',
    storage: 'supabase',
    supabaseConfigured: Boolean(supabaseUrl && supabaseServiceRoleKey),
  });
});

app.get('/api/courses', (_req, res) => {
  res.json({ courses: COURSES });
});

app.post('/api/bookings', async (req, res, next) => {
  try {
    const fullName = cleanString(req.body.fullName);
    const phone = cleanString(req.body.phone);
    const email = cleanString(req.body.email);
    const courseId = cleanString(req.body.courseId);
    const schedule = cleanString(req.body.schedule);
    const notes = cleanString(req.body.notes);
    const paymentReference = cleanString(req.body.paymentReference);

    if (!fullName || !phone || !courseId || !schedule || !paymentReference) {
      res.status(400).json({ error: 'Full name, phone, course, schedule, and payment reference are required.' });
      return;
    }

    const course = COURSES.find((item) => item.id === courseId);
    if (!course) {
      res.status(400).json({ error: 'Selected course does not exist.' });
      return;
    }

    const paymentVerified = await verifyPaystackReference(paymentReference);
    const booking: StoredBooking = {
      id: createId('booking'),
      fullName,
      phone,
      email: email || undefined,
      courseId,
      courseName: course.name,
      amount: course.price,
      schedule,
      notes: notes || undefined,
      paymentReference,
      paymentVerified,
      createdAt: new Date().toISOString(),
    };

    await persistBooking(booking);
    res.status(201).json({ booking });
  } catch (error) {
    next(error);
  }
});

app.post('/api/contacts', async (req, res, next) => {
  try {
    const name = cleanString(req.body.name);
    const email = cleanString(req.body.email);
    const message = cleanString(req.body.message);

    if (!name || !email || !message) {
      res.status(400).json({ error: 'Name, email, and message are required.' });
      return;
    }

    const contact: StoredContact = {
      id: createId('contact'),
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
    };

    await persistContact(contact);
    res.status(201).json({ contact });
  } catch (error) {
    next(error);
  }
});

app.use(express.static(distDir));
app.get('*', (_req, res, next) => {
  res.sendFile(path.join(distDir, 'index.html'), (error) => {
    if (error) next(error);
  });
});

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ error: error.message || 'Internal server error.' });
});

app.listen(port, () => {
  console.log(`Falcon backend listening on http://localhost:${port}`);
});
