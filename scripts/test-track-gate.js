import test from 'node:test';
import assert from 'node:assert/strict';
import MathGate, { ANSWER_LIMIT_MS, EXTENSION_MS } from '../src/entities/MathGate.js';

const question = { id: 'q', options: ['12', '16', '20', '24'], answer: 2, timeLimit: 15 };
function setup() {
  let time = 1000;
  const submissions = [];
  const gate = new MathGate({ events: { emit: (event, value) => {
    if (event === 'mathgate-submitted') submissions.push(value);
  } } }, () => time);
  gate.activate(question);
  return { gate, submissions, advance: ms => { time += ms; } };
}

test('all questions receive 60 seconds regardless of the old moving-gate time limit', () => {
  const { gate, advance } = setup();
  assert.equal(gate.getRemaining(), ANSWER_LIMIT_MS);
  advance(59000); gate.update();
  assert.equal(gate.checked, false);
  assert.equal(gate.getRemaining(), 1000);
});
test('expiry keeps the question paused until the player extends or reviews', () => {
  const { gate, advance, submissions } = setup();
  advance(90000); gate.update(); gate.update();
  assert.equal(gate.getRemaining(), 0);
  assert.equal(gate.active, true);
  assert.equal(gate.checked, false);
  assert.deepEqual(submissions, []);
  assert.equal(gate.submit(null), true);
  assert.deepEqual(submissions, [{ answer: null, timedOut: true }]);
  assert.equal(gate.submit(null), false);
  assert.equal(gate.extendTime(), false);
});
test('30 second extensions can be repeated before and after expiry', () => {
  const { gate, advance, submissions } = setup();
  advance(10000);
  assert.equal(gate.extendTime(), 80000);
  assert.equal(gate.extendTime(), 110000);
  assert.equal(gate.totalTime, ANSWER_LIMIT_MS + 2 * EXTENSION_MS);
  advance(120000); gate.update();
  assert.equal(gate.extendTime(), 30000);
  advance(40000); gate.update();
  assert.equal(gate.extendTime(), 30000);
  assert.equal(gate.submit(2), true);
  assert.deepEqual(submissions, [{ answer: 2, timedOut: false }]);
  assert.equal(gate.extendTime(), false);
});
test('inactive questions cannot be extended and each new question starts at 60 seconds', () => {
  const { gate } = setup();
  gate.extendTime();
  gate.deactivate();
  assert.equal(gate.extendTime(), false);
  gate.activate(question);
  assert.equal(gate.totalTime, ANSWER_LIMIT_MS);
  assert.equal(gate.getRemaining(), ANSWER_LIMIT_MS);
});
test('submit at the exact deadline cannot earn credit from a late click', () => {
  const { gate, advance, submissions } = setup();
  advance(60000); gate.submit(2);
  assert.deepEqual(submissions, [{ answer: null, timedOut: true }]);
});
test('all four options can be submitted; confirmation locks scoring against double clicks', () => {
  for (let answer = 0; answer < 4; answer++) {
    const { gate, submissions } = setup();
    assert.equal(gate.submit(answer), true);
    assert.equal(gate.submit(answer), false);
    assert.deepEqual(submissions, [{ answer, timedOut: false }]);
  }
});
test('no selection, invalid option, and stale submissions are ignored', () => {
  const { gate, submissions } = setup();
  for (const value of [null, undefined, -1, 4, '2']) assert.equal(gate.submit(value), false);
  gate.deactivate();
  assert.equal(gate.submit(2), false);
  assert.equal(submissions.length, 0);
});
test('a new checkpoint resets the deadline and accepts negative matrix values', () => {
  const { gate, advance, submissions } = setup();
  gate.submit(1); advance(25000);
  gate.activate({ type: 'matrixRepair', answerValue: -3 });
  assert.equal(gate.getRemaining(), 60000);
  assert.equal(gate.submit('-'), false);
  assert.equal(gate.submit('-3'), true);
  assert.deepEqual(submissions.at(-1), { answer: '-3', timedOut: false });
});
