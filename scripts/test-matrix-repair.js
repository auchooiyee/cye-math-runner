import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import QuestionSystem from '../src/systems/QuestionSystem.js';
import { formatMatrixEquation } from '../src/utils/MathFormatter.js';

const saved = new Map();
globalThis.localStorage = {
  getItem: key => saved.get(key) || null,
  setItem: (key, value) => saved.set(key, value)
};
const questions = JSON.parse(readFileSync(new URL('../public/data/questions.json', import.meta.url), 'utf8'));

test('matrix repair questions stay in the boss pool and out of ordinary gates', () => {
  const system = new QuestionSystem();
  system.loadQuestions(questions);
  const repairIds = new Set();
  for (let index = 0; index < 5; index++) {
    const question = system.getBossQuestion(2);
    assert.equal(question.type, 'matrixRepair');
    repairIds.add(question.id);
  }
  assert.equal(repairIds.size, 5);
  for (let index = 0; index < 20; index++) {
    assert.notEqual(system.getRandomQuestion(2, 1, 6).type, 'matrixRepair');
  }
});

test('number pad answers record correct, incorrect, and negative values', () => {
  const system = new QuestionSystem();
  system.loadQuestions(questions);
  const positive = questions.find(question => question.id === 'MAT-REPAIR-001');
  const negative = questions.find(question => question.id === 'MAT-REPAIR-004');
  assert.equal(system.validateAnswer(positive.id, positive.answerValue).correct, true);
  const mistake = system.validateAnswer(positive.id, '8');
  assert.equal(mistake.correct, false);
  assert.equal(mistake.selectedAnswer, '8');
  assert.equal(mistake.correctAnswer, '6');
  assert.equal(system.validateAnswer(negative.id, '-3').correct, true);
  assert.equal(system.getTotalStats().totalAsked, 3);
  assert.equal(system.getMistakes().length, 1);
  assert.equal(system.getMistakes()[0].type, 'matrixRepair');
});

test('repair equations show aligned two-dimensional matrices, not array syntax', () => {
  for (const question of questions.filter(item => item.type === 'matrixRepair')) {
    const formatted = formatMatrixEquation(question.question);
    assert.doesNotMatch(formatted, /\[\[/);
    assert.match(formatted, /⎡/);
    assert.match(formatted, /⎣/);
    assert.equal(formatted.split('\n').length, 4);
    assert.match(formatted, /\?/);
  }
  const addition = formatMatrixEquation(questions.find(item => item.id === 'MAT-REPAIR-001').question);
  assert.match(addition, /⎢\s+⎥ \+ ⎢\s+⎥ = ⎢\s+⎥/);
});

test('every marked repair value satisfies its full matrix equation', () => {
  const matrixPattern = /\[\s*\[[^\]]+\](?:\s*,\s*\[[^\]]+\])+\s*\]/g;
  for (const question of questions.filter(item => item.type === 'matrixRepair')) {
    const equation = question.question.split('\n').slice(1).join(' ');
    const matches = [...equation.matchAll(matrixPattern)];
    const matrices = matches.map(match => JSON.parse(match[0].replace('?', question.answerValue)));
    const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
    let actual;
    let expected;
    if (matrices.length === 2 && /^\s*\d+\s*×/.test(equation)) {
      const scalar = Number(equation.match(/^\s*(\d+)\s*×/)[1]);
      actual = matrices[0].map(row => row.map(value => scalar * value));
      expected = matrices[1];
    } else if (matrices.length === 2) {
      [actual, expected] = matrices;
    } else {
      const between = equation.slice(matches[0].index + matches[0][0].length, matches[1].index).trim();
      const [left, right, result] = matrices;
      expected = result;
      if (between === '×') {
        actual = left.map(row => right[0].map((_, column) =>
          row.reduce((sum, value, index) => sum + value * right[index][column], 0)));
      } else {
        assert.ok(between === '+' || between === '-', `${question.id}: recognized matrix operator`);
        actual = left.map((row, rowIndex) => row.map((value, column) =>
          between === '+' ? value + right[rowIndex][column] : value - right[rowIndex][column]));
      }
    }
    assert.ok(same(actual, expected), `${question.id}: marked answer satisfies the equation`);
  }
});
