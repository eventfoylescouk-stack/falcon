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
