import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanNickname } from '../src/ui/PlayerNameDialog.js';

test('nickname accepts leaderboard-safe student aliases', () => {
  assert.equal(cleanNickname('  Math  Pilot 7  '), 'Math Pilot 7');
  assert.equal(cleanNickname('数学家'), '数学家');
  assert.equal(cleanNickname('Number_Ninja-2'), 'Number_Ninja-2');
});

test('nickname rejects blank, unsupported, and overlong values', () => {
  assert.equal(cleanNickname('   '), null);
  assert.equal(cleanNickname('Fox!'), null);
  assert.equal(cleanNickname('a'.repeat(21)), null);
  assert.equal(cleanNickname(null), null);
});
