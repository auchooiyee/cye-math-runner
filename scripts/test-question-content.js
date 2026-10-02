import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const questions = JSON.parse(readFileSync(new URL('../public/data/questions.json', import.meta.url), 'utf8'));
const byId = id => {
  const question = questions.find(item => item.id === id);
  assert.ok(question, `${id} exists`);
  return question;
};

test('answer choices remain distinct after normalizing whitespace and case', () => {
  for (const question of questions.filter(item => item.type !== 'matrixRepair')) {
    const normalized = question.options.map(option => option.replace(/\s+/g, ' ').trim().toLowerCase());
    assert.equal(new Set(normalized).size, normalized.length, `${question.id}: distinct choices`);
  }
});

test('learner explanations contain no draft self-corrections', () => {
  for (const question of questions) {
    assert.doesNotMatch(question.explanation, /(?:\bwait,|\blet me\b|\bhmm\b|\brecompute\b|\bchange options\b)/i, question.id);
  }
});

test('break-even answer solves the stated profit model', () => {
  const question = byId('MODEL-019');
  const match = question.question.match(/Profit P = (-?\d+)x² \+ (\d+)x - (\d+)/);
  assert.ok(match, 'profit model is parseable');
  const [, quadratic, linear, constant] = match.map(Number);
  const roots = [...question.options[question.answer].matchAll(/\d+/g)].map(item => Number(item[0]));
  assert.equal(roots.length, 2);
  roots.forEach(x => assert.equal(quadratic * x ** 2 + linear * x - constant, 0, `x=${x} breaks even`));
});

test('tank answer uses volume, not flow rate', () => {
  const question = byId('MODEL-018');
  const match = question.question.match(/V\(t\) = (\d+) - (\d+)t litres/);
  assert.ok(match, 'model represents volume in litres');
  const [, initial, drainPerMinute] = match.map(Number);
  const minutes = Number(question.options[question.answer].match(/\d+/)[0]);
  assert.equal(initial - drainPerMinute * minutes, 0);
});

test('dispersion answers agree with their stated data', () => {
  const quartiles = byId('DATA-004');
  const values = quartiles.question.match(/Data: ([\d, ]+)/)[1].split(',').map(Number);
  const middle = Math.floor(values.length / 2);
  assert.equal(values[(middle + 1) + Math.floor(middle / 2)] - values[Math.floor(middle / 2)], Number(quartiles.options[quartiles.answer]));

  const deviation = byId('DATA-019');
  const [, count, sum, squaredSum] = deviation.question.match(/has (\d+) numbers with sum (\d+) and sum of squares (\d+)/).map(Number);
  const result = Math.sqrt(squaredSum / count - (sum / count) ** 2);
  assert.ok(Math.abs(result - Number(deviation.options[deviation.answer])) < 0.005);
});

test('tax questions distinguish chargeable income and the rebate cap', () => {
  const income = byId('TAX-002');
  assert.equal(income.options[income.answer], 'Chargeable income');
  assert.match(income.question, /allowable tax reliefs/i);

  const rebate = byId('TAX-011');
  assert.match(rebate.question, /before the tax-charged limit/i);
  assert.match(rebate.explanation, /cannot exceed the tax charged/i);
  assert.equal(rebate.options[rebate.answer], 'RM650');
});
