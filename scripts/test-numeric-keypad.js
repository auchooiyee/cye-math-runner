import test from 'node:test';
import assert from 'node:assert/strict';
import { editNumber } from '../src/ui/NumericKeypad.js';

test('keypad can build positive, zero and negative answers and toggle the sign', () => {
  assert.equal(editNumber('', '0'), '0');
  let value = editNumber('', 'minus');
  assert.equal(value, '-');
  value = editNumber(value, '1');
  value = editNumber(value, '2');
  assert.equal(value, '-12');
  assert.equal(editNumber(value, 'minus'), '12');
  assert.equal(editNumber('12', 'minus'), '-12');
});
test('delete corrects both digits and a remaining sign; invalid input is ignored', () => {
  let value = editNumber('-12', 'backspace');
  assert.equal(value, '-1');
  value = editNumber(value, 'backspace');
  assert.equal(value, '-');
  value = editNumber(value, 'backspace');
  assert.equal(value, '');
  assert.equal(editNumber(value, 'backspace'), '');
  assert.equal(editNumber('12', 'a'), '12');
  assert.equal(editNumber('-12345678', '9'), '-12345678');
  assert.equal(editNumber('-12', 'clear'), '');
});
