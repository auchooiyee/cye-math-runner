import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const questionsPath = join(__dirname, '..', 'public', 'data', 'questions.json');
const questions = JSON.parse(readFileSync(questionsPath, 'utf-8'));

// Format Chapter 2 questions specifically for SPM textbook standard
questions.forEach(q => {
  if (q.chapter === 2) {
    if (q.id === 'MAT-001') {
      q.question = 'Matrix A =\n┌ 2  1  4 ┐\n└ 3  0  5 ┘\nWhat is the order of matrix A?';
    } else if (q.id === 'MAT-003') {
      q.question = 'Matrix C =\n┌ 5  -2 ┐\n└ 7   9 ┘\nWhat is the element c₁₂?';
    } else if (q.id === 'MAT-004') {
      q.question = 'Add the matrices:\n[ 2   5 ] + [ 1  -3 ]';
      q.options = ['[ 3   2 ]', '[ 3  -8 ]', '[ 2   2 ]', '[ 1   8 ]'];
    } else if (q.id === 'MAT-005') {
      q.question = 'Subtract the matrices:\n┌ 4  2 ┐   ┌ 1  0 ┐\n└ 1  5 ┘ - └ 3  2 ┘';
      q.options = [
        '┌ 3   2 ┐\n└ -2  3 ┘',
        '┌ 5   2 ┐\n└ 4   7 ┘',
        '┌ 3   2 ┐\n└ 2   3 ┘',
        '┌ 3  -2 ┐\n└ -2  3 ┘'
      ];
    } else if (q.id === 'MAT-006') {
      q.question = 'If [ x   4 ] = [ 7   y-1 ], find x and y.';
    } else if (q.id === 'MAT-007') {
      q.question = 'Multiply: 3 × [ 2  -1   4 ]';
      q.options = ['[ 6  -3  12 ]', '[ 5   2   7 ]', '[ 6  -1   4 ]', '[ 6  -3   4 ]'];
    } else if (q.id === 'MAT-008') {
      q.question = 'If 1/2 A = [ 4   6 ], what is matrix A?';
      q.options = ['[ 2   3 ]', '[ 8  12 ]', '[ 4   6 ]', '[ 1/2  1/2 ]'];
    } else if (q.id === 'MAT-009') {
      q.question = 'Solve for matrix X:\n2X + [ 1   2 ] = [ 5   6 ]';
      q.options = ['[ 2   2 ]', '[ 3   4 ]', '[ 2   4 ]', '[ 4   4 ]'];
    } else if (q.id === 'MAT-010') {
      q.question = 'Multiply matrices:\n[ 2   1 ] × ┌ 3 ┐\n            └ 4 ┘';
      q.options = ['[ 10 ]', '[ 11 ]', '[ 14 ]', 'Not possible'];
    } else if (q.id === 'MAT-012') {
      q.question = 'Find AB if:\nA = ┌ 1  2 ┐ , B = ┌ 2  0 ┐\n    └ 0  3 ┘       └ 1  1 ┘';
      q.options = [
        '┌ 4  2 ┐\n└ 3  3 ┘',
        '┌ 2  0 ┐\n└ 0  3 ┘',
        '┌ 4  0 ┐\n└ 3  3 ┘',
        '┌ 3  2 ┐\n└ 0  4 ┘'
      ];
    } else if (q.id === 'MAT-013') {
      q.question = 'Find the determinant:\n| 3   1 |\n| 2   4 |';
    } else if (q.id === 'MAT-014') {
      q.question = 'Find the value of x if:\n| x   2 | = 2\n| 3   4 |    ';
    } else if (q.id === 'MAT-015') {
      q.question = 'Find the inverse of matrix:\n┌ 2   1 ┐\n└ 1   1 ┘';
      q.options = [
        '┌  1  -1 ┐\n└ -1   2 ┘',
        '┌ -1   1 ┐\n└  1  -2 ┘',
        '┌  1   1 ┐\n└  1   2 ┘',
        '┌  2  -1 ┐\n└ -1   1 ┘'
      ];
    } else if (q.id === 'MAT-016') {
      q.question = 'Which matrix has NO inverse (det = 0)?';
      q.options = [
        '┌ 2  4 ┐\n└ 1  2 ┘',
        '┌ 1  0 ┐\n└ 0  1 ┘',
        '┌ 2  3 ┐\n└ 1  4 ┘',
        '┌ 0  1 ┐\n└ 1  0 ┘'
      ];
    } else if (q.id === 'MAT-017') {
      q.question = 'Given simultaneous equations:\n2x + y = 5\nx - y = 1\nWhat is the coefficient matrix A in AX = B?';
      q.options = [
        '┌ 2   1 ┐\n└ 1  -1 ┘',
        '┌ 2   1 ┐\n└ 1   1 ┘',
        '┌ 2  -1 ┐\n└ 1   1 ┘',
        '┌ 1   1 ┐\n└ 2  -1 ┘'
      ];
    } else if (q.id === 'MAT-018') {
      q.question = 'Solve the matrix equation for [x, y]:\n┌ 2  1 ┐ ┌ x ┐   ┌  7 ┐\n└ 1  3 ┘ └ y ┘ = └ 11 ┘';
      q.options = ['[ 2   3 ]', '[ 3   2 ]', '[ 1   4 ]', '[ 4   1 ]'];
    } else if (q.id === 'MAT-019') {
      q.question = 'Given the matrix equation:\n┌ 3  -2 ┐ ┌ x ┐   ┌ 1 ┐\n└ 4  -3 ┘ └ y ┘ = └ 2 ┘\nFind the value of x.';
    }
  }
});

writeFileSync(questionsPath, JSON.stringify(questions, null, 2), 'utf-8');
console.log('Successfully formatted matrix questions in questions.json');
