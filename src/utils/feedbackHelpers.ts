import { MathProblem } from '../types';

// Encouraging messages for wrong answers (growth mindset)
const encouragingMessages = [
  "Almost! Let's see how...",
  "Good try! Here's a tip:",
  "Keep going! The answer is",
  "You're learning! It's",
  "Nice effort! Let's see:",
  "So close! Here's how:",
];

// Get a random encouraging message
export function getEncouragingMessage(): string {
  return encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
}

// Generate a strategy hint based on the problem type
export function getStrategyHint(problem: MathProblem): string {
  const { operation, questionDisplay, answer } = problem;

  // Parse numbers from the question display
  const numbers = questionDisplay.match(/\d+/g)?.map(Number) || [];

  switch (operation) {
    case 'addition': {
      if (numbers.length >= 2) {
        const [a, b] = numbers;
        // Different strategies based on the numbers
        if (a <= 5 && b <= 5) {
          // Simple counting on
          return `Count up from ${a}: ${Array.from({ length: b }, (_, i) => a + i + 1).join(', ')} = ${answer}`;
        } else if (b <= 3) {
          // Count on for small addends
          const countUp = Array.from({ length: b }, (_, i) => a + i + 1);
          return `Start at ${a}, count ${b} more: ${countUp.join(', ')}`;
        } else if (a + b <= 10) {
          return `${a} + ${b} = ${answer}`;
        } else if (a >= 10 || b >= 10) {
          // Break apart for larger numbers
          return `${a} + ${b} = ${answer}`;
        } else {
          // Make 10 strategy
          const toTen = 10 - a;
          if (toTen <= b && toTen > 0) {
            return `Make 10: ${a} + ${toTen} = 10, then +${b - toTen} = ${answer}`;
          }
          return `${a} + ${b} = ${answer}`;
        }
      }
      return `The answer is ${answer}`;
    }

    case 'subtraction': {
      if (numbers.length >= 2) {
        const [a, b] = numbers;
        if (b <= 3) {
          // Count back for small subtrahends
          const countBack = Array.from({ length: b }, (_, i) => a - i - 1);
          return `Start at ${a}, count back ${b}: ${countBack.join(', ')}`;
        } else {
          return `${a} - ${b} = ${answer}`;
        }
      }
      return `The answer is ${answer}`;
    }

    case 'multiplication': {
      if (numbers.length >= 2) {
        const [a, b] = numbers;
        if (a === 2) {
          return `2 × ${b} = double ${b} = ${answer}`;
        } else if (a === 5) {
          return `5 × ${b} = count by 5s: ${Array.from({ length: b }, (_, i) => (i + 1) * 5).join(', ')}`;
        } else if (a === 10) {
          return `10 × ${b} = add a zero: ${answer}`;
        } else {
          return `${a} groups of ${b} = ${answer}`;
        }
      }
      return `The answer is ${answer}`;
    }

    case 'counting': {
      return `Count each one: the answer is ${answer}`;
    }

    case 'comparison': {
      if (numbers.length >= 2) {
        const [a, b] = numbers;
        return `${answer} is bigger because ${answer > Math.min(a, b) ? `${answer} > ${Math.min(a, b)}` : ''}`;
      }
      return `${answer} is the bigger number`;
    }

    case 'missing_addend': {
      if (numbers.length >= 2) {
        const [known, total] = numbers;
        return `Think: ${total} - ${known} = ${answer}`;
      }
      return `The answer is ${answer}`;
    }

    default:
      return `The answer is ${answer}`;
  }
}
