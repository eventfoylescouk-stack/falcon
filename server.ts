import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import rateLimit from "express-rate-limit";

// Define server-side database path for verified transactions
const DB_FILE = path.join(process.cwd(), "bookings_db.json");

function isProductionRuntime() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}

function allowLocalJsonDb() {
  return !isProductionRuntime() || process.env.ALLOW_LOCAL_JSON_DB === "true";
}

function getServerSupabase(): SupabaseClient | null {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function assertProductionPersistence(supabase: SupabaseClient | null) {
  if (!supabase && !allowLocalJsonDb()) {
    throw new Error("Supabase persistence is required in production. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel, or explicitly set ALLOW_LOCAL_JSON_DB=true only for non-production testing.");
  }
}

function toBookingRow(booking: VerifiedBooking) {
  return {
    id: booking.id,
    full_name: booking.fullName,
    phone: booking.phone,
    email: booking.email,
    course_id: booking.courseId,
    schedule: booking.schedule,
    notes: booking.notes || null,
    reference: booking.reference,
    amount: booking.amount,
    status: booking.status,
    created_at: booking.createdAt,
    paid_at: booking.paidAt || booking.createdAt || null
  };
}

function getAppBaseUrl(req?: express.Request) {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, "");
  }

  if (req) {
    const protocol = req.protocol || "http";
    const host = req.get("host") || "localhost:3000";
    return `${protocol}://${host}`.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

async function upsertPaidBooking(booking: VerifiedBooking) {
  const supabase = getServerSupabase();
  assertProductionPersistence(supabase);

  if (!supabase) {
    const db = getLocalDb();
    const existing = db.bookings.find(b => b.reference === booking.reference);
    if (existing) Object.assign(existing, booking, { paidAt: existing.paidAt || booking.paidAt });
    else db.bookings.push(booking);
    if (!db.verifiedReferences.includes(booking.reference)) db.verifiedReferences.push(booking.reference);
    saveLocalDb(db);
    return;
  }

  const { error } = await supabase
    .from("bookings")
    .upsert(toBookingRow(booking), { onConflict: "reference" });

  if (error) {
    throw new Error(`Supabase booking upsert failed: ${error.message}`);
  }
}

function fromBookingRow(row: any): VerifiedBooking {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    courseId: row.course_id,
    schedule: row.schedule,
    notes: row.notes || "",
    reference: row.reference,
    amount: Number(row.amount || 0),
    status: row.status,
    createdAt: row.created_at,
    paidAt: row.paid_at || undefined
  };
}

async function getBookingsDb(): Promise<BookingsDb> {
  const supabase = getServerSupabase();
  assertProductionPersistence(supabase);

  if (!supabase) {
    return getLocalDb();
  }

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("*");

  if (bookingsError) {
    throw new Error(`Supabase bookings read failed: ${bookingsError.message}`);
  }

  const { data: webhookRows, error: webhookError } = await supabase
    .from("paystack_webhook_events")
    .select("reference");

  if (webhookError) {
    throw new Error(`Supabase webhook read failed: ${webhookError.message}`);
  }

  const mappedBookings = (bookings || []).map(fromBookingRow);
  return {
    bookings: mappedBookings,
    verifiedReferences: mappedBookings.map(booking => booking.reference),
    webhookReferences: (webhookRows || []).map(row => row.reference)
  };
}

async function saveBookingsDb(db: BookingsDb) {
  const supabase = getServerSupabase();
  assertProductionPersistence(supabase);

  if (!supabase) {
    saveLocalDb(db);
    return;
  }

  if (db.bookings.length > 0) {
    const { error } = await supabase
      .from("bookings")
      .upsert(db.bookings.map(toBookingRow), { onConflict: "reference" });

    if (error) {
      throw new Error(`Supabase bookings save failed: ${error.message}`);
    }
  }
}

async function markWebhookProcessed(reference: string): Promise<boolean> {
  const supabase = getServerSupabase();
  assertProductionPersistence(supabase);

  if (!supabase) {
    const db = getLocalDb();
    db.webhookReferences = db.webhookReferences || [];
    if (db.webhookReferences.includes(reference)) return false;
    db.webhookReferences.push(reference);
    saveLocalDb(db);
    return true;
  }

  const { error } = await supabase
    .from("paystack_webhook_events")
    .insert({ reference });

  if (!error) return true;
  if (error.code === "23505") return false;
  throw new Error(`Supabase webhook marker failed: ${error.message}`);
}

interface VerifiedBooking {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  courseId: string;
  schedule: string;
  notes?: string;
  reference: string;
  amount: number;
  status: string;
  createdAt: string;
  paidAt?: string;
}

interface BookingsDb {
  verifiedReferences: string[];
  bookings: VerifiedBooking[];
  webhookReferences?: string[];
}

// Read database helper
function getLocalDb(): BookingsDb {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading server bookings database:", err);
  }
  return { verifiedReferences: [], bookings: [], webhookReferences: [] };
}

// Write database helper
function saveLocalDb(db: BookingsDb) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing server bookings database:", err);
  }
}

export async function createApp() {
  const app = express();

  // Rate limiting for payment endpoints to prevent abuse
  const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: { status: false, message: "Too many payment requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Rate limiting for verification endpoints
  const verifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Limit each IP to 30 requests per windowMs
    message: { status: false, message: "Too many verification requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Input validation middleware
  const validateBookingInput = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { amount, email, courseId, schedule, fullName, phone, notes } = req.body;

    // Validate required fields
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ status: false, message: "Invalid amount. Must be a positive number." });
    }

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ status: false, message: "Email is required." });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ status: false, message: "Invalid email format." });
    }

    if (!courseId || typeof courseId !== 'string' || courseId.trim().length === 0) {
      return res.status(400).json({ status: false, message: "Course ID is required." });
    }

    if (!schedule || typeof schedule !== 'string' || schedule.trim().length === 0) {
      return res.status(400).json({ status: false, message: "Schedule is required." });
    }

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return res.status(400).json({ status: false, message: "Full name must be at least 2 characters." });
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length < 10) {
      return res.status(400).json({ status: false, message: "Phone number must be at least 10 characters." });
    }

    // Sanitize notes if provided
    if (notes && typeof notes === 'string') {
      req.body.notes = notes.trim().substring(0, 500); // Limit notes to 500 characters
    }

    // Sanitize all string inputs
    req.body.email = email.trim().toLowerCase();
    req.body.courseId = courseId.trim();
    req.body.schedule = schedule.trim();
    req.body.fullName = fullName.trim();
    req.body.phone = phone.trim();

    next();
  };

  app.use("/api/webhooks/paystack", express.raw({ type: "application/json" }));
  app.use(express.json());

  // Paystack Keys Setup
  // Server-side Paystack calls require a secret key. Support the deployed names currently used by this app.
  const getPaystackSecretKey = () => {
    const key = (
      process.env.PAYSTACK_SECRET_KEY ||
      process.env.VITE_PAYSTACK_SECRET_KEY ||
      process.env.VITE_PAYSTACK_ANON_KEY ||
      ""
    ).trim();

    if (!key) {
      // In development, allow missing key (graceful degradation)
      if (process.env.NODE_ENV === 'development') {
        console.warn("[⚠️ DEV MODE] Paystack secret key not set. Payment initialization will fail gracefully.");
        console.warn("[⚠️ DEV MODE] To enable Paystack: Add PAYSTACK_SECRET_KEY=sk_test_... to .env file");
        return null;
      }
      throw new Error("Missing Paystack secret key. Set PAYSTACK_SECRET_KEY in .env for production.");
    }

    if (key.startsWith("pk_")) {
      throw new Error("Your current Paystack key is a public key (pk_...). Public keys are only for browser checkout testing. Add PAYSTACK_SECRET_KEY=sk_test_... for backend initialization, verification, and webhooks.");
    }

    return key;
  };

  // API 1: Initialize transaction with backend Paystack call
  app.post("/api/payment/initialize", paymentLimiter, validateBookingInput, async (req, res) => {
    try {
      const { amount, email, courseId, schedule, fullName, phone, notes } = req.body;

      const secretKey = getPaystackSecretKey();

      // Dev mode without Paystack key: Return mock authorization URL for testing
      if (!secretKey) {
        const reference = "FALCON_DEV_" + Date.now() + "_" + Math.floor(Math.random() * 9000 + 1000);
        const mockAuthUrl = "https://checkout.paystack.com/mock-test-" + reference;
        console.log(`[DEV MODE] Mock payment initialized (no real charge): ${reference} for ${email}`);
        return res.status(200).json({
          status: true,
          authorizationUrl: mockAuthUrl,
          reference,
          message: "DEV MODE: Mock Paystack URL. Use public key checkout on frontend for actual testing."
        });
      }

      const reference = "FALCON_P_" + Date.now() + "_" + Math.floor(Math.random() * 9000 + 1000);
      
      // Determine the redirect callback URL from the app origin, not the current page path.
      // Paystack requires an absolute callback URL; using Referer here can produce
      // broken URLs such as /signup/api/payment/callback and prevent the app from
      // returning students to their dashboard after payment.
      const cleanHost = getAppBaseUrl(req);
      const callbackUrl = `${cleanHost}/api/payment/callback`;

      const paystackPayload = {
        email: email.toLowerCase().trim(),
        amount: Math.round(amount * 100), // convert Naira/USD to Kobo/cents
        reference,
        callback_url: callbackUrl,
        metadata: {
          courseId,
          schedule,
          fullName,
          phone,
          notes: notes || "",
          amountNaira: amount
        }
      };

      console.log(`[Paystack Server] Spawning payment reference: ${reference} for ${email}`);

      const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${secretKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(paystackPayload)
      });

      const responseData = await paystackRes.json();

      if (!paystackRes.ok || !responseData.status) {
        console.error("[Paystack Server Error]:", responseData);
        return res.status(500).json({
          status: false,
          message: responseData.message || "Failed to contact Paystack gateway."
        });
      }

      // Return authorization url to redirect frontend user seamlessly
      return res.json({
        status: true,
        authorizationUrl: responseData.data.authorization_url,
        reference: responseData.data.reference
      });

    } catch (error: any) {
      console.error("[Paystack Route Error]:", error);
      return res.status(500).json({ 
        status: false, 
        message: error.message || "Internal payment setup failure" 
      });
    }
  });

  // API 2: Paystack Callback Receiver - Direct Verification!
  app.get("/api/payment/callback", async (req, res) => {
    try {
      const reference = req.query.reference as string;
      if (!reference) {
        return res.status(400).send("No reference found in callback.");
      }

      console.log(`[Paystack Callback] Verifying transaction reference: ${reference}...`);

      const cleanHost = getAppBaseUrl(req);

      const secretKey = getPaystackSecretKey();

      // Dev mode: Auto-approve all mock references for testing
      if (!secretKey && reference.startsWith("FALCON_DEV_")) {
        console.log(`[DEV MODE] Auto-approving mock reference: ${reference}`);
        const db = await getBookingsDb();
        
        // Store as mock verified booking
        if (!db.verifiedReferences.includes(reference)) {
          db.verifiedReferences.push(reference);
          
          const mockBooking: VerifiedBooking = {
            id: "bk_dev_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
            fullName: "Test Student (Dev Mode)",
            phone: "08000000000",
            email: "test@example.com",
            courseId: "test-course",
            schedule: "test-schedule",
            notes: "Development mode booking - no actual payment",
            reference,
            amount: 0,
            status: "dev-verified",
            createdAt: new Date().toISOString(),
            paidAt: new Date().toISOString()
          };

          await upsertPaidBooking(mockBooking);
          console.log(`[DEV MODE] Mock booking created: ${reference}`);
        }
        
        return res.redirect(`${cleanHost}/?payment_status=success&reference=${reference}&amount=0&dev_mode=true`);
      }

      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${secretKey}`,
          "Content-Type": "application/json"
        }
      });

      const resData = await verifyRes.json();

      if (!verifyRes.ok || !resData.status || resData.data.status !== "success") {
        console.error(`[Paystack Callback] Verification failed for ${reference}:`, resData);
        // Redirect to UI with failure parameter
        return res.redirect(`${cleanHost}/?payment_status=failed&reference=${reference}&reason=${encodeURIComponent(resData.message || "Unverified txn")}`);
      }

      // TRANSACTION APPROVED SECURELY BY THE BACKEND SERVER!
      const pmData = resData.data;
      const metadata = pmData.metadata;
      const amountNaira = pmData.amount / 100;

      const db = await getBookingsDb();

      // Check if reference already processed to prevent duplications
      if (!db.verifiedReferences.includes(reference)) {
        db.verifiedReferences.push(reference);

        // Add verified booking record
        const newBooking: VerifiedBooking = {
          id: "bk_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
          fullName: metadata.fullName || "Student Athlete",
          phone: metadata.phone || "N/A",
          email: pmData.customer.email,
          courseId: metadata.courseId || "basic-intensive",
          schedule: metadata.schedule || "weekday-morning",
          notes: metadata.notes || "",
          reference,
          amount: amountNaira,
          status: "paid",
          createdAt: new Date().toISOString(),
          paidAt: new Date().toISOString()
        };

        await upsertPaidBooking(newBooking);
        console.log(`[Paystack Server] SECURELY VERIFIED & LOGGED: Booking of ${newBooking.fullName} (${newBooking.email})`);
      }

      // Always redirect to the application after callback verification.
      return res.redirect(`${cleanHost}/?payment_status=success&reference=${reference}&amount=${amountNaira}`);
    } catch (err: any) {
      console.error("[Paystack Callback Exception]:", err);
      const cleanHost = getAppBaseUrl(req);
      return res.redirect(`${cleanHost}/?payment_status=error&reason=${encodeURIComponent(err.message || "Failed callback handling")}`);
    }
  });

  // API 3: Query Verification from UI (always validates against Paystack before finalizing)
  app.get("/api/payment/verify-status", verifyLimiter, async (req, res) => {
    try {
      const reference = String(req.query.reference || "").trim();
      if (!reference) {
        return res.status(400).json({ status: false, message: "Missing reference parameter." });
      }

      const secretKey = getPaystackSecretKey();

      // Dev mode: Auto-verify mock references
      if (!secretKey && reference.startsWith("FALCON_DEV_")) {
        const db = await getBookingsDb();
        let booking = db.bookings.find(b => b.reference === reference);
        
        if (!booking) {
          booking = {
            id: "bk_dev_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
            fullName: "Test Student",
            phone: "08000000000",
            email: "test@example.com",
            courseId: "test-course",
            schedule: "test-schedule",
            notes: "",
            reference,
            amount: 0,
            status: "dev-verified",
            createdAt: new Date().toISOString(),
            paidAt: new Date().toISOString()
          };
          db.bookings.push(booking);
          await saveBookingsDb(db);
        }

        return res.json({
          status: true,
          verified: true,
          message: "[DEV MODE] Mock payment verified",
          booking
        });
      }

      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${secretKey}`,
          "Content-Type": "application/json"
        }
      });

      const resData = await verifyRes.json();
      if (!verifyRes.ok || !resData.status || resData.data?.status !== "success") {
        return res.json({
          status: true,
          verified: false,
          message: resData.message || "Transaction has not been verified as successful by Paystack."
        });
      }

      const pmData = resData.data;
      const metadata = pmData.metadata || {};
      const amountNaira = Number(pmData.amount || 0) / 100;
      const customerEmail = (pmData.customer?.email || metadata.email || "").toLowerCase().trim();
      const db = await getBookingsDb();
      db.webhookReferences = db.webhookReferences || [];

      let booking = db.bookings.find(b => b.reference === reference);
      if (!db.verifiedReferences.includes(reference)) {
        db.verifiedReferences.push(reference);
      }

      if (!booking) {
        booking = {
          id: "bk_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
          fullName: metadata.fullName || metadata.full_name || "Driving Student",
          phone: metadata.phone || "N/A",
          email: customerEmail,
          courseId: metadata.courseId || metadata.course_id || "basic-intensive",
          schedule: metadata.schedule || "weekday-morning",
          notes: metadata.notes || "",
          reference,
          amount: amountNaira,
          status: "paid",
          createdAt: new Date().toISOString(),
          paidAt: new Date().toISOString()
        };
        db.bookings.push(booking);
      } else if (booking.status !== "paid") {
        booking.status = "paid";
        booking.paidAt = booking.paidAt || new Date().toISOString();
      }

      await saveBookingsDb(db);
      return res.json({ status: true, verified: true, booking });

    } catch (err: any) {
      return res.status(500).json({ status: false, message: err.message });
    }
  });

  app.post("/api/webhooks/paystack", async (req, res) => {
    try {
      const secretKey = getPaystackSecretKey();
      const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body || {}));
      const expectedSignature = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");
      const receivedSignature = String(req.headers["x-paystack-signature"] || "");

      if (!receivedSignature || receivedSignature.length !== expectedSignature.length || !crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(receivedSignature))) {
        return res.status(401).json({ status: false, message: "Invalid Paystack signature." });
      }

      const event = JSON.parse(rawBody.toString("utf-8"));
      if (event.event !== "charge.success") {
        return res.json({ status: true, ignored: true });
      }

      const transaction = event.data || {};
      const reference = String(transaction.reference || "").trim();
      if (!reference) {
        return res.status(400).json({ status: false, message: "Missing transaction reference." });
      }

      const db = await getBookingsDb();
      db.webhookReferences = db.webhookReferences || [];
      if (db.webhookReferences.includes(reference)) {
        return res.json({ status: true, duplicate: true, message: "Webhook reference already processed." });
      }

      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${secretKey}`, "Content-Type": "application/json" }
      });
      const verifyJson = await verifyRes.json();
      if (!verifyRes.ok || !verifyJson.status || verifyJson.data?.status !== "success") {
        return res.status(202).json({ status: true, verified: false, message: "Webhook accepted; Paystack verification pending." });
      }

      const metadata = verifyJson.data.metadata || transaction.metadata || {};
      const amountNaira = Number(verifyJson.data.amount || transaction.amount || 0) / 100;
      const customerEmail = (verifyJson.data.customer?.email || transaction.customer?.email || "").toLowerCase().trim();
      let booking = db.bookings.find(b => b.reference === reference);

      if (!booking) {
        booking = {
          id: "bk_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
          fullName: metadata.fullName || metadata.full_name || "Driving Student",
          phone: metadata.phone || "N/A",
          email: customerEmail,
          courseId: metadata.courseId || metadata.course_id || "basic-intensive",
          schedule: metadata.schedule || "weekday-morning",
          notes: metadata.notes || "",
          reference,
          amount: amountNaira,
          status: "paid",
          createdAt: new Date().toISOString(),
          paidAt: new Date().toISOString()
        };
        db.bookings.push(booking);
      } else {
        booking.status = "paid";
        booking.paidAt = booking.paidAt || new Date().toISOString();
      }

      const isNewWebhook = await markWebhookProcessed(reference);
      if (!isNewWebhook) {
        return res.json({ status: true, duplicate: true, message: "Webhook reference already processed." });
      }

      if (!db.verifiedReferences.includes(reference)) db.verifiedReferences.push(reference);
      await saveBookingsDb(db);

      return res.json({ status: true, processed: true });
    } catch (err: any) {
      console.error("[Paystack Webhook Exception]:", err);
      return res.status(500).json({ status: false, message: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  return app;
}

export async function startServer() {
  const app = await createApp();
  const PORT = Number(process.env.PORT || 3000);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting and running on full-stack PORT ${PORT}`);
  });
}

if (process.env.VERCEL !== "1") {
  startServer();
}
