import type { BookingSubmission, ContactSubmission } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function postJson<TResponse>(path: string, payload: unknown): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Request failed. Please try again.');
  }

  return data as TResponse;
}

export function createBooking(booking: BookingSubmission) {
  return postJson<{ booking: BookingSubmission }>('/api/bookings', booking);
}

export function createContact(contact: ContactSubmission) {
  return postJson<{ contact: ContactSubmission }>('/api/contacts', contact);
}
