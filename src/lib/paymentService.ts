export interface InitializePaymentPayload {
  amount: number;
  email: string;
  courseId: string;
  schedule: string;
  fullName: string;
  phone: string;
  notes?: string;
  reference?: string;
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
    reference?: string;
    amount?: number;
    status?: string;
    createdAt: string;
  };
}

async function loadPaystackInlineScript(): Promise<any> {
  if (typeof window === 'undefined') {
    throw new Error('Paystack inline checkout can only be loaded in the browser.');
  }

  if ((window as any).PaystackPop) {
    return (window as any).PaystackPop;
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-paystack-inline]');
    if (existing) {
      existing.addEventListener('load', () => resolve((window as any).PaystackPop));
      existing.addEventListener('error', () => reject(new Error('Failed to load Paystack inline script.')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.setAttribute('data-paystack-inline', 'true');
    script.onload = () => resolve((window as any).PaystackPop);
    script.onerror = () => reject(new Error('Failed to load Paystack inline script.'));
    document.head.appendChild(script);
  });
}

export async function openPaystackInlineCheckout(
  payload: InitializePaymentPayload,
  onSuccess: (response: { reference: string; status: string }) => void,
  onClose?: () => void
): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('Paystack inline checkout can only be opened in the browser.');
  }

  const publicKey = (import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY || '';
  if (!publicKey) {
    throw new Error('Missing Paystack public key. Set VITE_PAYSTACK_PUBLIC_KEY in .env.');
  }

  const PaystackPop = await loadPaystackInlineScript();
  const reference = payload.reference || `AUTH_PAY_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`;

  const handler = PaystackPop.setup({
    key: publicKey,
    email: payload.email,
    amount: Math.round(payload.amount * 100),
    ref: reference,
    metadata: {
      courseId: payload.courseId,
      schedule: payload.schedule,
      fullName: payload.fullName,
      phone: payload.phone,
      notes: payload.notes || '',
      source: 'registration'
    },
    onClose: () => {
      if (onClose) onClose();
    },
    callback: (response: { reference: string; status: string }) => {
      onSuccess({ reference: response.reference, status: response.status || 'success' });
    }
  });

  handler.openIframe();
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
