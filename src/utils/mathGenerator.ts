import { MathProblem, MathOperation, GradeLevel } from '../types';

// Generate a unique ID for problems
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Shuffle array helper
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate wrong answers that are plausible but not correct
function generateWrongAnswers(correctAnswer: number, count: number, operation: MathOperation): number[] {
  const wrongAnswers: Set<number> = new Set();

  // Add some close wrong answers
  const offsets = [-2, -1, 1, 2, -3, 3, -4, 4, -5, 5, 10, -10];

  for (const offset of shuffleArray(offsets)) {
    const wrong = correctAnswer + offset;
    if (wrong >= 0 && wrong !== correctAnswer) {
      wrongAnswers.add(wrong);
    }
    if (wrongAnswers.size >= count) break;
  }

  // If we need more, add random ones
  while (wrongAnswers.size < count) {
    let wrong: number;
    if (correctAnswer < 10) {
      wrong = Math.floor(Math.random() * 15);
    } else if (correctAnswer < 20) {
      wrong = Math.floor(Math.random() * 25);
    } else {
      wrong = Math.floor(Math.random() * (correctAnswer * 1.5));
    }
    if (wrong >= 0 && wrong !== correctAnswer) {
      wrongAnswers.add(wrong);
    }
  }

  return Array.from(wrongAnswers).slice(0, count);
}

// Generate addition problem
function generateAddition(maxSum: number): { a: number; b: number } {
  const a = Math.floor(Math.random() * maxSum);
  const b = Math.floor(Math.random() * (maxSum - a + 1));
  return { a, b };
}

// Generate subtraction problem
function generateSubtraction(maxNum: number): { a: number; b: number } {
  const a = Math.floor(Math.random() * (maxNum + 1));
  const b = Math.floor(Math.random() * (a + 1));
  return { a, b };
}

// Generate multiplication problem
function generateMultiplication(maxFactor: number, allowedFactors?: number[]): { a: number; b: number } {
  const factors = allowedFactors || [2, 5, 10];
  const a = factors[Math.floor(Math.random() * factors.length)];
  const b = Math.floor(Math.random() * (maxFactor + 1));
  return { a, b };
}

// Generate a problem for Kindergarten level
function generateKindergartenProblem(operation?: MathOperation): MathProblem {
  const operations: MathOperation[] = operation ? [operation] : ['addition', 'subtraction', 'counting', 'comparison'];
  const selectedOp = operations[Math.floor(Math.random() * operations.length)];

  let question: string;
  let questionDisplay: string;
  let answer: number;

  switch (selectedOp) {
    case 'counting': {
      answer = Math.floor(Math.random() * 10) + 1;
      const emoji = ['🍎', '⭐', '🌸', '🦋', '🎈'][Math.floor(Math.random() * 5)];
      questionDisplay = emoji.repeat(answer);
      question = `How many ${emoji}?`;
      break;
    }
    case 'comparison': {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      if (a === b) {
        return generateKindergartenProblem('comparison');
      }
      question = `Which is bigger?`;
      questionDisplay = `${a}  or  ${b}`;
      answer = Math.max(a, b);
      break;
    }
    case 'addition': {
      const { a, b } = generateAddition(5);
      question = `${a} + ${b} = ?`;
      questionDisplay = `${a} + ${b}`;
      answer = a + b;
      break;
    }
    case 'subtraction': {
      const { a, b } = generateSubtraction(5);
      question = `${a} - ${b} = ?`;
      questionDisplay = `${a} - ${b}`;
      answer = a - b;
      break;
    }
    default: {
      const { a, b } = generateAddition(5);
      question = `${a} + ${b} = ?`;
      questionDisplay = `${a} + ${b}`;
      answer = a + b;
    }
  }

  const wrongAnswers = generateWrongAnswers(answer, 3, selectedOp);
  const options = shuffleArray([answer, ...wrongAnswers]);

  return {
    id: generateId(),
    question,
    questionDisplay,
    answer,
    options,
    operation: selectedOp,
    difficulty: 1,
    gradeLevel: 'kindergarten',
  };
}

// Generate a problem for First Grade level
function generateFirstGradeProblem(operation?: MathOperation, difficulty: number = 2): MathProblem {
  const operations: MathOperation[] = operation
    ? [operation]
    : ['addition', 'subtraction', 'missing_addend'];
  const selectedOp = operations[Math.floor(Math.random() * operations.length)];

  let question: string;
  let questionDisplay: string;
  let answer: number;
  const maxNum = difficulty <= 2 ? 10 : 20;

  switch (selectedOp) {
    case 'addition': {
      const { a, b } = generateAddition(maxNum);
      question = `${a} + ${b} = ?`;
      questionDisplay = `${a} + ${b}`;
      answer = a + b;
      break;
    }
    case 'subtraction': {
      const { a, b } = generateSubtraction(maxNum);
      question = `${a} - ${b} = ?`;
      questionDisplay = `${a} - ${b}`;
      answer = a - b;
      break;
    }
    case 'missing_addend': {
      const total = Math.floor(Math.random() * maxNum) + 1;
      const known = Math.floor(Math.random() * total);
      answer = total - known;
      question = `? + ${known} = ${total}`;
      questionDisplay = `? + ${known} = ${total}`;
      break;
    }
    default: {
      const { a, b } = generateAddition(maxNum);
      question = `${a} + ${b} = ?`;
      questionDisplay = `${a} + ${b}`;
      answer = a + b;
    }
  }

  const wrongAnswers = generateWrongAnswers(answer, 3, selectedOp);
  const options = shuffleArray([answer, ...wrongAnswers]);

  return {
    id: generateId(),
    question,
    questionDisplay,
    answer,
    options,
    operation: selectedOp,
    difficulty,
    gradeLevel: 'first',
  };
}

// Generate a problem for Second Grade level
function generateSecondGradeProblem(operation?: MathOperation, difficulty: number = 4): MathProblem {
  const operations: MathOperation[] = operation
    ? [operation]
    : ['addition', 'subtraction', 'multiplication'];
  const selectedOp = operations[Math.floor(Math.random() * operations.length)];

  let question: string;
  let questionDisplay: string;
  let answer: number;
  const maxNum = difficulty <= 4 ? 50 : 100;

  switch (selectedOp) {
    case 'addition': {
      const { a, b } = generateAddition(maxNum);
      question = `${a} + ${b} = ?`;
      questionDisplay = `${a} + ${b}`;
      answer = a + b;
      break;
    }
    case 'subtraction': {
      const { a, b } = generateSubtraction(maxNum);
      question = `${a} - ${b} = ?`;
      questionDisplay = `${a} - ${b}`;
      answer = a - b;
      break;
    }
    case 'multiplication': {
      const { a, b } = generateMultiplication(10, [2, 5, 10]);
      question = `${a} x ${b} = ?`;
      questionDisplay = `${a} x ${b}`;
      answer = a * b;
      break;
    }
    default: {
      const { a, b } = generateAddition(maxNum);
      question = `${a} + ${b} = ?`;
      questionDisplay = `${a} + ${b}`;
      answer = a + b;
    }
  }

  const wrongAnswers = generateWrongAnswers(answer, 3, selectedOp);
  const options = shuffleArray([answer, ...wrongAnswers]);

  return {
    id: generateId(),
    question,
    questionDisplay,
    answer,
    options,
    operation: selectedOp,
    difficulty,
    gradeLevel: 'second',
  };
}

// Generate a problem based on difficulty level (for Endless mode)
// Difficulty scale: 1-10
// 1-2: Kindergarten
// 3-4: First Grade (within 10)
// 5-6: First Grade (within 20)
// 7-8: Second Grade (within 50)
// 9-10: Second Grade (within 100 + multiplication)
export function generateProblemByDifficulty(difficulty: number): MathProblem {
  const normalizedDifficulty = Math.min(10, Math.max(1, difficulty));

  if (normalizedDifficulty <= 2) {
    return generateKindergartenProblem();
  } else if (normalizedDifficulty <= 4) {
    return generateFirstGradeProblem(undefined, normalizedDifficulty);
  } else if (normalizedDifficulty <= 6) {
    return generateFirstGradeProblem(undefined, normalizedDifficulty);
  } else {
    return generateSecondGradeProblem(undefined, normalizedDifficulty);
  }
}

// Generate a problem for a specific grade level and operation (for Worksheet mode)
export function generateProblemForWorksheet(gradeLevel: GradeLevel, operation: MathOperation): MathProblem {
  switch (gradeLevel) {
    case 'kindergarten':
      return generateKindergartenProblem(operation);
    case 'first':
      return generateFirstGradeProblem(operation);
    case 'second':
      return generateSecondGradeProblem(operation);
    default:
      return generateKindergartenProblem(operation);
  }
}

// Generate a full worksheet of problems
export function generateWorksheet(gradeLevel: GradeLevel, operation: MathOperation, count: number = 10): MathProblem[] {
  const problems: MathProblem[] = [];
  for (let i = 0; i < count; i++) {
    problems.push(generateProblemForWorksheet(gradeLevel, operation));
  }
  return problems;
}

// Calculate difficulty increase based on streak
export function calculateDifficultyFromStreak(streak: number): number {
  // Every 5 correct answers, increase difficulty by 1
  // Start at difficulty 1, max at 10
  return Math.min(10, Math.floor(streak / 5) + 1);
}
