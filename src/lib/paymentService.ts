export interface InitializePaymentPayload {
  amount: number;
  email: string;
  courseId: string;
  schedule: string;
  fullName: string;
  phone: string;
  notes?: string;
}

export interface InitializePaymentResponse {
  status: boolean;
  authorizationUrl?: string;
  reference?: string;
  message?: string;
}

export interface VerifyPaymentStatusResponse {
  status: boolean;
  verified: boolean;
  message?: string;
  booking?: {
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
  };
}

export async function initializePayment(payload: InitializePaymentPayload): Promise<InitializePaymentResponse> {
  const res = await fetch('/api/payment/initialize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      email: payload.email.toLowerCase().trim(),
      amount: Number(payload.amount),
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.status || !data.authorizationUrl) {
    throw new Error(data.message || 'Unable to initialize Paystack checkout.');
  }

  return data;
}

export async function verifyPaymentStatus(reference: string): Promise<VerifyPaymentStatusResponse> {
  const res = await fetch(`/api/payment/verify-status?reference=${encodeURIComponent(reference)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.status) {
    throw new Error(data.message || 'Unable to verify payment status.');
  }
  return data;
}

export function openPaystackCheckoutModal(authorizationUrl: string): Window | null {
  const width = 520;
  const height = 720;
  const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
  const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);

  return window.open(
    authorizationUrl,
    'falcon_paystack_checkout',
    `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no`
  );
}


interface PaystackInlineResponse {
  reference: string;
  status: string;
  trans?: string;
  transaction?: string;
  trxref?: string;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

function getPaystackPublicKey(): string {
  const env = (import.meta as any).env || {};
  const key = (env.VITE_PAYSTACK_PUBLIC_KEY || env.VITE_PAYSTACK_ANON_KEY || '').trim();
  if (!key) {
    throw new Error('Missing Paystack public key. Set VITE_PAYSTACK_PUBLIC_KEY=pk_test_... for browser checkout testing.');
  }
  if (!key.startsWith('pk_')) {
    throw new Error('Browser checkout requires a Paystack public key that starts with pk_. Keep sk_ keys only on the backend.');
  }
  return key;
}

function loadPaystackInlineScript(): Promise<void> {
  if (window.PaystackPop) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://js.paystack.co/v1/inline.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Unable to load Paystack inline script.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load Paystack inline script.'));
    document.head.appendChild(script);
  });
}

export async function openPaystackInlineCheckout(
  payload: InitializePaymentPayload,
  onSuccess: (response: PaystackInlineResponse) => void,
  onClose?: () => void
): Promise<string> {
  const publicKey = getPaystackPublicKey();
  await loadPaystackInlineScript();

  const reference = `FALCON_P_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`;
  const handler = window.PaystackPop?.setup({
    key: publicKey,
    email: payload.email.toLowerCase().trim(),
    amount: Math.round(Number(payload.amount) * 100),
    ref: reference,
    metadata: {
      courseId: payload.courseId,
      schedule: payload.schedule,
      fullName: payload.fullName,
      phone: payload.phone,
      notes: payload.notes || '',
      amountNaira: Number(payload.amount),
    },
    callback: onSuccess,
    onClose,
  });

  if (!handler) {
    throw new Error('Unable to open Paystack checkout. Please refresh and try again.');
  }

  handler.openIframe();
  return reference;
}
