import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

// Define server-side database path for verified transactions
const DB_FILE = path.join(process.cwd(), "bookings_db.json");

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
}

interface BookingsDb {
  verifiedReferences: string[];
  bookings: VerifiedBooking[];
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
  return { verifiedReferences: [], bookings: [] };
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

  app.use(express.json());

  // Paystack Keys Setup
  // Fallback to a valid test secret key so that development/sandbox integration builds are fully seamless
  const getPaystackSecretKey = () => {
    return process.env.PAYSTACK_SECRET_KEY || "sk_test_65df0e58dc2c1a0be5fbdf6d6e2798539097ee79";
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
          status: "verified",
          createdAt: new Date().toISOString()
        };

        db.bookings.push(newBooking);
        saveDb(db);
        console.log(`[Paystack Server] SECURELY VERIFIED & LOGGED: Booking of ${newBooking.fullName} (${newBooking.email})`);
      }

      // Redirect client back with verification approval query markers
      return res.redirect(`${cleanHost}/?payment_status=success&reference=${reference}&amount=${amountNaira}`);

    } catch (err: any) {
      console.error("[Paystack Callback Exception]:", err);
      const hostUrl = process.env.APP_URL || req.headers.referer || req.headers.origin || "http://localhost:3000";
      const cleanHost = hostUrl.split("?")[0].replace(/\/$/, "");
      return res.redirect(`${cleanHost}/?payment_status=error&reason=${encodeURIComponent(err.message || "Failed callback handling")}`);
    }
  });

  // API 3: Query Verification from UI (Polling or Page Reload Verification)
  app.get("/api/payment/verify-status", async (req, res) => {
    try {
      const reference = req.query.reference as string;
      if (!reference) {
        return res.status(400).json({ status: false, message: "Missing reference parameter." });
      }

      const db = getDb();
      const isVerified = db.verifiedReferences.includes(reference);
      const booking = db.bookings.find(b => b.reference === reference);

      if (isVerified && booking) {
        return res.json({
          status: true,
          verified: true,
          booking
        });
      }

      // Fallback verification call in case of delays in Paystack redirect callbacks
      console.log(`[Paystack Status Call] Dynamic backup checks for reference ${reference}...`);
      const secretKey = getPaystackSecretKey();
      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${secretKey}`,
          "Content-Type": "application/json"
        }
      });

      const resData = await verifyRes.json();
      if (verifyRes.ok && resData.status && resData.data.status === "success") {
        const pmData = resData.data;
        const metadata = pmData.metadata;
        const amountNaira = pmData.amount / 100;

        if (!db.verifiedReferences.includes(reference)) {
          db.verifiedReferences.push(reference);
          const backupBooking: VerifiedBooking = {
            id: "bk_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
            fullName: metadata.fullName || "Student athlete",
            phone: metadata.phone || "N/A",
            email: pmData.customer.email,
            courseId: metadata.courseId || "basic-intensive",
            schedule: metadata.schedule || "weekday-morning",
            notes: metadata.notes || "",
            reference,
            amount: amountNaira,
            status: "verified",
            createdAt: new Date().toISOString()
          };
          db.bookings.push(backupBooking);
          saveDb(db);
        }

        return res.json({
          status: true,
          verified: true,
          booking: db.bookings.find(b => b.reference === reference)
        });
      }

      return res.json({
        status: true,
        verified: false,
        message: "Transaction not yet verified."
      });

    } catch (err: any) {
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
