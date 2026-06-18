import assert from 'node:assert/strict';

interface BookingRecord {
  reference: string;
  status: 'pending' | 'paid';
}

interface PaymentDb {
  verifiedReferences: string[];
  webhookReferences: string[];
  bookings: BookingRecord[];
}

function processPaidReference(db: PaymentDb, reference: string) {
  if (!db.verifiedReferences.includes(reference)) {
    db.verifiedReferences.push(reference);
  }

  let booking = db.bookings.find(entry => entry.reference === reference);
  if (!booking) {
    booking = { reference, status: 'paid' };
    db.bookings.push(booking);
  } else {
    booking.status = 'paid';
  }

  if (db.webhookReferences.includes(reference)) {
    return { duplicate: true, booking };
  }

  db.webhookReferences.push(reference);
  return { duplicate: false, booking };
}

const db: PaymentDb = { verifiedReferences: [], webhookReferences: [], bookings: [] };
const first = processPaidReference(db, 'FALCON_TEST_REF');
const second = processPaidReference(db, 'FALCON_TEST_REF');

assert.equal(first.duplicate, false);
assert.equal(second.duplicate, true);
assert.equal(db.bookings.length, 1, 'duplicate webhook must not create a second booking');
assert.deepEqual(db.verifiedReferences, ['FALCON_TEST_REF']);
assert.deepEqual(db.webhookReferences, ['FALCON_TEST_REF']);
assert.equal(db.bookings[0].status, 'paid');

console.log('payment idempotency test passed');
