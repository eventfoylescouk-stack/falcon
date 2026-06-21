import assert from 'node:assert/strict';

function resolvePaystackSecret(env: Record<string, string | undefined>) {
  const key = (env.PAYSTACK_SECRET_KEY || '').trim();

  if (!key) {
    throw new Error('Missing Paystack secret key. Set PAYSTACK_SECRET_KEY in .env for production.');
  }

  if (key.startsWith('pk_')) {
    throw new Error('Your current Paystack key is a public key (pk_...). Public keys are only for browser checkout testing. Add PAYSTACK_SECRET_KEY=sk_test_... for backend initialization, verification, and webhooks.');
  }

  return key;
}

assert.equal(resolvePaystackSecret({ PAYSTACK_SECRET_KEY: 'sk_live_primary', VITE_PAYSTACK_ANON_KEY: 'sk_test_secondary' }), 'sk_live_primary');
assert.throws(() => resolvePaystackSecret({ VITE_PAYSTACK_PUBLIC_KEY: 'pk_test_public' }), /Missing Paystack secret key/);
assert.throws(() => resolvePaystackSecret({ VITE_PAYSTACK_ANON_KEY: 'sk_test_public' }), /Missing Paystack secret key/);

console.log('paystack env resolution test passed');
