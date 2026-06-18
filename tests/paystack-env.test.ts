import assert from 'node:assert/strict';

function resolvePaystackSecret(env: Record<string, string | undefined>) {
  const key = (
    env.PAYSTACK_SECRET_KEY ||
    env.VITE_PAYSTACK_SECRET_KEY ||
    env.VITE_PAYSTACK_ANON_KEY ||
    ''
  ).trim();

  if (!key) {
    throw new Error('Missing Paystack secret key. Set PAYSTACK_SECRET_KEY or VITE_PAYSTACK_ANON_KEY in .env.');
  }

  if (key.startsWith('pk_')) {
    throw new Error('Paystack initialization requires a secret key (sk_...). VITE_PAYSTACK_PUBLIC_KEY cannot be used for backend verification.');
  }

  return key;
}

assert.equal(resolvePaystackSecret({ VITE_PAYSTACK_ANON_KEY: ' sk_test_from_anon ' }), 'sk_test_from_anon');
assert.equal(resolvePaystackSecret({ PAYSTACK_SECRET_KEY: 'sk_live_primary', VITE_PAYSTACK_ANON_KEY: 'sk_test_secondary' }), 'sk_live_primary');
assert.throws(() => resolvePaystackSecret({ VITE_PAYSTACK_PUBLIC_KEY: 'pk_test_public' }), /Missing Paystack secret key/);
assert.throws(() => resolvePaystackSecret({ VITE_PAYSTACK_ANON_KEY: 'pk_test_public' }), /requires a secret key/);

console.log('paystack env resolution test passed');
