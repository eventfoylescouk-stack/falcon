import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promises as fs } from 'node:fs';
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
const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
const bookingsFile = path.join(dataDir, 'bookings.json');
const contactsFile = path.join(dataDir, 'contacts.json');
const distDir = path.resolve(__dirname, '../dist');

app.use(express.json({ limit: '1mb' }));

async function ensureDataFile(filePath: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, '[]\n', 'utf8');
  }
}

async function readJsonArray<T>(filePath: string): Promise<T[]> {
  await ensureDataFile(filePath);
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw) as unknown;
  return Array.isArray(parsed) ? parsed as T[] : [];
}

async function appendJsonRecord<T>(filePath: string, record: T) {
  const records = await readJsonArray<T>(filePath);
  records.push(record);
  await fs.writeFile(filePath, `${JSON.stringify(records, null, 2)}\n`, 'utf8');
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
  res.json({ ok: true, service: 'falcon-backend' });
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

    await appendJsonRecord(bookingsFile, booking);
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

    await appendJsonRecord(contactsFile, contact);
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
