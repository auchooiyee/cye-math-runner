import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const questionsPath = join(__dirname, '..', 'public', 'data', 'questions.json');
let questions;
try {
  const raw = readFileSync(questionsPath, 'utf-8');
  questions = JSON.parse(raw);
} catch (e) {
  console.error("❌ Failed to read or parse questions.json:", e.message);
  process.exit(1);
}

let passed = 0;
let total = 0;
let hasError = false;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`✅ ${message}`);
  } else {
    hasError = true;
    console.error(`❌ ${message}`);
  }
}

const ids = new Set();

questions.forEach((q, index) => {
  const qStr = `Question ${index + 1} (${q.id || 'Unknown ID'})`;
  
  // 4. Question ID is unique across all questions
  assert(!ids.has(q.id), `${qStr}: ID is unique`);
  ids.add(q.id);

  // 7. All required fields present
  const requiredFields = ['id', 'chapter', 'topic', 'difficulty', 'type', 'question', 'options', 'answer', 'explanation'];
  for (const field of requiredFields) {
    assert(q[field] !== undefined && q[field] !== null, `${qStr}: Has field '${field}'`);
  }

  // 8. No empty string values for required text fields
  const textFields = ['id', 'topic', 'type', 'question', 'explanation'];
  for (const field of textFields) {
    if (typeof q[field] === 'string') {
      assert(q[field].trim() !== '', `${qStr}: Field '${field}' is not empty`);
    }
  }

  // 1. answer index exists within options array (0 <= answer < options.length)
  if (Array.isArray(q.options)) {
    assert(q.answer >= 0 && q.answer < q.options.length, `${qStr}: Answer index ${q.answer} is within options range`);
    
    // 2. Exactly 4 options per question
    assert(q.options.length === 4, `${qStr}: Exactly 4 options`);
    
    // 3. No duplicate options within a question
    const uniqueOptions = new Set(q.options);
    assert(uniqueOptions.size === q.options.length, `${qStr}: No duplicate options`);
  } else {
    assert(false, `${qStr}: options is not an array`);
  }

  // 5. Chapter is valid (1-8)
  assert(q.chapter >= 1 && q.chapter <= 8, `${qStr}: Chapter is valid (1-8)`);

  // 6. Difficulty is 1-6
  assert(q.difficulty >= 1 && q.difficulty <= 6, `${qStr}: Difficulty is 1-6`);

  // 9. points is a positive number
  assert(typeof q.points === 'number' && q.points > 0, `${qStr}: points is a positive number`);

  // 10. timeLimit is a positive number
  assert(typeof q.timeLimit === 'number' && q.timeLimit > 0, `${qStr}: timeLimit is a positive number`);
});

console.log(`\n${passed}/${total} validations passed`);
if (hasError) {
  process.exit(1);
} else {
  process.exit(0);
}
