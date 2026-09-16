import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const questionsPath = join(__dirname, '..', 'public', 'data', 'questions.json');
const questions = JSON.parse(readFileSync(questionsPath, 'utf-8'));

const newChapter5Questions = [
  {
    "id": "TRF-001",
    "chapter": 5,
    "topic": "Congruency",
    "subtopic": "",
    "difficulty": 1,
    "type": "mcq",
    "question": "Which of the following proves triangle similarity, but NOT congruency?",
    "options": ["AAA", "SSS", "SAS", "RHS"],
    "answer": 0,
    "explanation": "AAA (Angle-Angle-Angle) proves triangles have the same shape (similarity), but does not guarantee the same size (congruency).",
    "formula": "",
    "timeLimit": 15,
    "points": 100,
    "bossEligible": false
  },
  {
    "id": "TRF-002",
    "chapter": 5,
    "topic": "Congruency",
    "subtopic": "",
    "difficulty": 1,
    "type": "mcq",
    "question": "Two triangles have 3 pairs of corresponding equal sides. Which congruency rule applies?",
    "options": ["SSS", "SAS", "ASA", "AAS"],
    "answer": 0,
    "explanation": "SSS stands for Side-Side-Side, where all three corresponding sides are equal.",
    "formula": "",
    "timeLimit": 15,
    "points": 100,
    "bossEligible": false
  },
  {
    "id": "TRF-003",
    "chapter": 5,
    "topic": "Congruency",
    "subtopic": "",
    "difficulty": 2,
    "type": "mcq",
    "question": "In triangle congruency, what does the RHS criterion stand for?",
    "options": [
      "Right angle-Hypotenuse-Side",
      "Radius-Height-Side",
      "Ratio-Height-Slope",
      "Rotation-Horizontal-Shift"
    ],
    "answer": 0,
    "explanation": "RHS stands for Right angle, Hypotenuse, and one corresponding Side.",
    "formula": "",
    "timeLimit": 15,
    "points": 100,
    "bossEligible": false
  },
  {
    "id": "TRF-004",
    "chapter": 5,
    "topic": "Isometry",
    "subtopic": "",
    "difficulty": 2,
    "type": "mcq",
    "question": "Which transformation is NOT an isometric transformation (does not preserve size)?",
    "options": ["Enlargement", "Translation", "Reflection", "Rotation"],
    "answer": 0,
    "explanation": "An isometric transformation preserves distance and size. Enlargement changes the size of the object.",
    "formula": "",
    "timeLimit": 15,
    "points": 100,
    "bossEligible": false
  },
  {
    "id": "TRF-005",
    "chapter": 5,
    "topic": "Scale Factor",
    "subtopic": "",
    "difficulty": 2,
    "type": "mcq",
    "question": "An object of length 6 cm is enlarged to an image of length 18 cm. Find scale factor k.",
    "options": ["3", "2", "6", "12"],
    "answer": 0,
    "explanation": "Scale factor k = Image length ÷ Object length = 18 ÷ 6 = 3.",
    "formula": "k = Image Length / Object Length",
    "timeLimit": 15,
    "points": 100,
    "bossEligible": false
  },
  {
    "id": "TRF-006",
    "chapter": 5,
    "topic": "Scale Factor",
    "subtopic": "",
    "difficulty": 2,
    "type": "mcq",
    "question": "An object with length 20 cm is enlarged with scale factor k = 1/4. Find the image length.",
    "options": ["5 cm", "4 cm", "10 cm", "80 cm"],
    "answer": 0,
    "explanation": "Image length = k × Object length = (1/4) × 20 = 5 cm.",
    "formula": "Image = k × Object",
    "timeLimit": 15,
    "points": 100,
    "bossEligible": false
  },
  {
    "id": "TRF-007",
    "chapter": 5,
    "topic": "Scale Factor",
    "subtopic": "",
    "difficulty": 2,
    "type": "mcq",
    "question": "If the scale factor k of an enlargement satisfies 0 < k < 1, what happens to the image?",
    "options": [
      "Smaller than object",
      "Larger than object",
      "Same size as object",
      "Inverted and larger"
    ],
    "answer": 0,
    "explanation": "When 0 < k < 1, the enlargement diminishes (reduces) the size of the object.",
    "formula": "",
    "timeLimit": 15,
    "points": 100,
    "bossEligible": false
  },
  {
    "id": "TRF-008",
    "chapter": 5,
    "topic": "Scale Factor",
    "subtopic": "",
    "difficulty": 2,
    "type": "mcq",
    "question": "What does a negative scale factor (e.g. k = -2) indicate about the image?",
    "options": [
      "Inverted on opposite side of centre",
      "Negative area value",
      "Shrunk by half",
      "Reflected across y-axis"
    ],
    "answer": 0,
    "explanation": "A negative scale factor means the image is inverted and lies on the opposite side of the centre of enlargement.",
    "formula": "",
    "timeLimit": 15,
    "points": 100,
    "bossEligible": false
  },
  {
    "id": "TRF-009",
    "chapter": 5,
    "topic": "Scale Factor",
    "subtopic": "",
    "difficulty": 2,
    "type": "mcq",
    "question": "An image has length 28 cm and the scale factor is k = 4. What was the object length?",
    "options": ["7 cm", "8 cm", "112 cm", "6 cm"],
    "answer": 0,
    "explanation": "Object length = Image length ÷ k = 28 ÷ 4 = 7 cm.",
    "formula": "",
    "timeLimit": 15,
    "points": 100,
    "bossEligible": false
  },
  {
    "id": "TRF-010",
    "chapter": 5,
    "topic": "Combined Transformations",
    "subtopic": "",
    "difficulty": 2,
    "type": "mcq",
    "question": "For a combined transformation represented as VT, which transformation is applied first?",
    "options": [
      "Transformation T",
      "Transformation V",
      "Both simultaneously",
      "The larger one"
    ],
    "answer": 0,
    "explanation": "In transformation notation VT, the rightmost transformation (T) is performed first, followed by V.",
    "formula": "",
    "timeLimit": 15,
    "points": 100,
    "bossEligible": false
  },
  {
    "id": "TRF-011",
    "chapter": 5,
    "topic": "Area of Enlargement",
    "subtopic": "",
    "difficulty": 3,
    "type": "mcq",
    "question": "An object with area 8 cm² is enlarged with scale factor k = 3. What is the image area?",
    "options": ["72 cm²", "24 cm²", "48 cm²", "64 cm²"],
    "answer": 0,
    "explanation": "Area of image = k² × Area of object = 3² × 8 = 9 × 8 = 72 cm².",
    "formula": "Area Image = k² × Area Object",
    "timeLimit": 20,
    "points": 150,
    "bossEligible": false
  },
  {
    "id": "TRF-012",
    "chapter": 5,
    "topic": "Area of Enlargement",
    "subtopic": "",
    "difficulty": 3,
    "type": "mcq",
    "question": "An object with area 5 cm² is enlarged to an image of area 80 cm². Find scale factor k (k > 0).",
    "options": ["4", "16", "8", "2"],
    "answer": 0,
    "explanation": "k² = Image area ÷ Object area = 80 ÷ 5 = 16. Since k > 0, k = √16 = 4.",
    "formula": "k² = Area Image / Area Object",
    "timeLimit": 20,
    "points": 150,
    "bossEligible": false
  },
  {
    "id": "TRF-013",
    "chapter": 5,
    "topic": "Area of Enlargement",
    "subtopic": "",
    "difficulty": 3,
    "type": "mcq",
    "question": "Under an enlargement with k = 5, the image area is 150 cm². What is the object area?",
    "options": ["6 cm²", "30 cm²", "10 cm²", "15 cm²"],
    "answer": 0,
    "explanation": "Area of object = Image area ÷ k² = 150 ÷ 5² = 150 ÷ 25 = 6 cm².",
    "formula": "",
    "timeLimit": 20,
    "points": 150,
    "bossEligible": false
  },
  {
    "id": "TRF-014",
    "chapter": 5,
    "topic": "Area of Enlargement",
    "subtopic": "",
    "difficulty": 3,
    "type": "mcq",
    "question": "An object with area 12 cm² is enlarged with scale factor k = -3. Find the area of the image.",
    "options": ["108 cm²", "-108 cm²", "36 cm²", "-36 cm²"],
    "answer": 0,
    "explanation": "Area is always positive: Area of image = k² × Area of object = (-3)² × 12 = 9 × 12 = 108 cm².",
    "formula": "",
    "timeLimit": 20,
    "points": 150,
    "bossEligible": false
  },
  {
    "id": "TRF-015",
    "chapter": 5,
    "topic": "Area of Enlargement",
    "subtopic": "",
    "difficulty": 3,
    "type": "mcq",
    "question": "If linear scale factor increases from k = 2 to k = 4, the image area increases by a factor of:",
    "options": ["4 times", "2 times", "8 times", "16 times"],
    "answer": 0,
    "explanation": "Area ratio = 4² / 2² = 16 / 4 = 4 times.",
    "formula": "",
    "timeLimit": 20,
    "points": 150,
    "bossEligible": false
  },
  {
    "id": "TRF-016",
    "chapter": 5,
    "topic": "Invariant Points",
    "subtopic": "",
    "difficulty": 3,
    "type": "mcq",
    "question": "Which point remains unchanged (invariant) under a rotation about a centre?",
    "options": [
      "The centre of rotation",
      "The x-intercept",
      "The highest vertex",
      "The midpoint of any side"
    ],
    "answer": 0,
    "explanation": "The centre of rotation does not move during a rotation, so it is the only invariant point.",
    "formula": "",
    "timeLimit": 20,
    "points": 150,
    "bossEligible": false
  },
  {
    "id": "TRF-017",
    "chapter": 5,
    "topic": "Shaded Region Area",
    "subtopic": "",
    "difficulty": 4,
    "type": "mcq",
    "question": "An object has area 10 cm². Under enlargement with k = 3, find the area of the shaded region (Image − Object).",
    "options": ["80 cm²", "90 cm²", "70 cm²", "20 cm²"],
    "answer": 0,
    "explanation": "Image area = 3² × 10 = 90 cm². Shaded region = Image area - Object area = 90 - 10 = 80 cm².",
    "formula": "Shaded Area = Image Area - Object Area",
    "timeLimit": 20,
    "points": 150,
    "bossEligible": true
  },
  {
    "id": "TRF-018",
    "chapter": 5,
    "topic": "Shaded Region Area",
    "subtopic": "",
    "difficulty": 5,
    "type": "mcq",
    "question": "The shaded region (Image − Object) has area 48 cm². If scale factor k = 3, find the area of the object.",
    "options": ["6 cm²", "8 cm²", "12 cm²", "16 cm²"],
    "answer": 0,
    "explanation": "Shaded area = (k² - 1) × Object area. 48 = (3² - 1) × Object area = 8 × Object area. Object area = 48 ÷ 8 = 6 cm².",
    "formula": "Shaded Area = (k² - 1) × Object Area",
    "timeLimit": 30,
    "points": 200,
    "bossEligible": true
  },
  {
    "id": "TRF-019",
    "chapter": 5,
    "topic": "Combined Transformations",
    "subtopic": "",
    "difficulty": 4,
    "type": "mcq",
    "question": "Transformation P is enlargement with k = 2. Transformation Q is reflection. Find image area under QP if object area is 15 cm².",
    "options": ["60 cm²", "30 cm²", "120 cm²", "15 cm²"],
    "answer": 0,
    "explanation": "P is applied first: Area = 2² × 15 = 60 cm². Q is reflection (isometric, preserves area): Final area remains 60 cm².",
    "formula": "",
    "timeLimit": 20,
    "points": 150,
    "bossEligible": true
  },
  {
    "id": "TRF-020",
    "chapter": 5,
    "topic": "Shaded Region Area",
    "subtopic": "",
    "difficulty": 5,
    "type": "mcq",
    "question": "An object has area 14 cm². Under enlargement with k = 4, what is the ratio of Object Area to Shaded Region Area?",
    "options": ["1 : 15", "1 : 16", "1 : 4", "1 : 8"],
    "answer": 0,
    "explanation": "Image area = 16 × Object area. Shaded region = (16 - 1) × Object area = 15 × Object area. Ratio = 1 : 15.",
    "formula": "",
    "timeLimit": 30,
    "points": 200,
    "bossEligible": true
  }
];

// Replace TRF-001 through TRF-020 in the questions array
const updatedQuestions = questions.map(q => {
  if (q.chapter === 5) {
    const replacement = newChapter5Questions.find(nq => nq.id === q.id);
    return replacement || q;
  }
  return q;
});

writeFileSync(questionsPath, JSON.stringify(updatedQuestions, null, 2), 'utf-8');
console.log('Successfully updated Chapter 5 with formula-based diagram-free questions!');
