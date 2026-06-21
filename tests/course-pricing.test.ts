import assert from 'node:assert/strict';
import { getServerCoursePrice, validatePaymentAmountForCourse } from '../server.ts';

assert.equal(getServerCoursePrice('std_2w_beginners'), 95000);
assert.equal(getServerCoursePrice('adv_executive'), 350000);
assert.equal(getServerCoursePrice('missing-course'), null);

assert.deepEqual(validatePaymentAmountForCourse('std_2w_beginners', 95000), {
  valid: true,
  expectedAmount: 95000
});

assert.deepEqual(validatePaymentAmountForCourse('adv_executive', 1), {
  valid: false,
  message: 'Submitted amount does not match the selected course price.',
  expectedAmount: 350000
});

assert.deepEqual(validatePaymentAmountForCourse('unknown', 95000), {
  valid: false,
  message: 'Invalid course selected.'
});

console.log('course pricing validation test passed');
