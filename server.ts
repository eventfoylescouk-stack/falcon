import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Define server-side database path for verified transactions
const DB_FILE = path.join(process.cwd(), "bookings_db.json");

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

function toBookingRow(booking: VerifiedBooking) {
  return {
    full_name: booking.fullName,
    phone: booking.phone,
    email: booking.email,
    course_id: booking.courseId,
    schedule: booking.schedule,
    notes: booking.notes || null,
    reference: booking.reference,
    amount: booking.amount,
    status: booking.status,
    paid_at: booking.paidAt || null
  };
}

async function upsertPaidBooking(booking: VerifiedBooking) {
  const supabase = getServerSupabase();
  if (!supabase) {
    const db = getDb();
    const existing = db.bookings.find(b => b.reference === booking.reference);
    if (existing) Object.assign(existing, booking, { paidAt: existing.paidAt || booking.paidAt });
    else db.bookings.push(booking);
    if (!db.verifiedReferences.includes(booking.reference)) db.verifiedReferences.push(booking.reference);
    saveDb(db);
    return;
  }

  const { error } = await supabase
    .from("bookings")
    .upsert(toBookingRow(booking), { onConflict: "reference" });

  if (error) {
    throw new Error(`Supabase booking upsert failed: ${error.message}`);
  }
}

async function markWebhookProcessed(reference: string): Promise<boolean> {
  const db = getDb();
  db.webhookReferences = db.webhookReferences || [];
  if (db.webhookReferences.includes(reference)) return false;
  db.webhookReferences.push(reference);
  saveDb(db);
  return true;
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
function getDb(): BookingsDb {
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
function saveDb(db: BookingsDb) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing server bookings database:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

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
      throw new Error("Missing Paystack secret key. Set PAYSTACK_SECRET_KEY or VITE_PAYSTACK_ANON_KEY in .env.");
    }

    if (key.startsWith("pk_")) {
      throw new Error("Your current Paystack key is a public key (pk_...). Public keys are only for browser checkout testing. Add PAYSTACK_SECRET_KEY=sk_test_... for backend initialization, verification, and webhooks.");
    }

    return key;
  };

  // API 1: Initialize transaction with backend Paystack call
  app.post("/api/payment/initialize", async (req, res) => {
    try {
      const { amount, email, courseId, schedule, fullName, phone, notes } = req.body;

      if (!amount || !email || !courseId || !schedule || !fullName || !phone) {
        return res.status(400).json({ 
          status: false, 
          message: "Required booking and checkout details are missing." 
        });
      }

      const secretKey = getPaystackSecretKey();
      const reference = "FALCON_P_" + Date.now() + "_" + Math.floor(Math.random() * 9000 + 1000);
      
      // Determine the redirect callback URL dynamically from headers
      const hostUrl = process.env.APP_URL || req.headers.referer || req.headers.origin || "http://localhost:3000";
      // We clean trailing slashes from hostUrl
      const cleanHost = hostUrl.replace(/\/$/, "");
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

      const secretKey = getPaystackSecretKey();
      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${secretKey}`,
          "Content-Type": "application/json"
        }
      });

      const resData = await verifyRes.json();

      const hostUrl = process.env.APP_URL || req.headers.referer || req.headers.origin || "http://localhost:3000";
      const cleanHost = hostUrl.split("?")[0].replace(/\/$/, "");

      if (!verifyRes.ok || !resData.status || resData.data.status !== "success") {
        console.error(`[Paystack Callback] Verification failed for ${reference}:`, resData);
        // Redirect to UI with failure parameter
        return res.redirect(`${cleanHost}/?payment_status=failed&reference=${reference}&reason=${encodeURIComponent(resData.message || "Unverified txn")}`);
      }

      // TRANSACTION APPROVED SECURELY BY THE BACKEND SERVER!
      const pmData = resData.data;
      const metadata = pmData.metadata;
      const amountNaira = pmData.amount / 100;

      const db = getDb();

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

      // Redirect client back with verification approval query markers
      return res.redirect(`${cleanHost}/?payment_status=success&reference=${reference}&amount=${amountNaira}`);

    } catch (err: any) {
      console.error("[Paystack Callback Exception]:", err);
      const hostUrl = process.env.APP_URL || req.headers.referer || req.headers.origin || "http://localhost:3000";
      const cleanHost = hostUrl.split("?")[0].replace(/\/$/, "");
      return res.redirect(`${cleanHost}/?payment_status=error&reason=${encodeURIComponent(err.message || "Failed callback handling")}`);
    }
  });

  // API 3: Query Verification from UI (always validates against Paystack before finalizing)
  app.get("/api/payment/verify-status", async (req, res) => {
    try {
      const reference = String(req.query.reference || "").trim();
      if (!reference) {
        return res.status(400).json({ status: false, message: "Missing reference parameter." });
      }

      const secretKey = getPaystackSecretKey();
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
      const db = getDb();
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

      saveDb(db);
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

      const db = getDb();
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

      if (!db.verifiedReferences.includes(reference)) db.verifiedReferences.push(reference);
      db.webhookReferences.push(reference);
      saveDb(db);

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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting and running on full-stack PORT ${PORT}`);
  });
}

startServer();
