import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/testUtils';
import { MathQuestion } from './MathQuestion';
import { createMockProblem } from '../../test/testUtils';

describe('MathQuestion', () => {
  describe('rendering basic problems', () => {
    it('should render question display text', () => {
      const problem = createMockProblem({
        questionDisplay: '5 + 3',
        operation: 'addition',
      });

      render(<MathQuestion problem={problem} />);
      expect(screen.getByText('5 + 3')).toBeInTheDocument();
    });

    it('should render equals and question mark', () => {
      const problem = createMockProblem({
        questionDisplay: '10 - 4',
        operation: 'subtraction',
      });

      render(<MathQuestion problem={problem} />);
      expect(screen.getByText('= ?')).toBeInTheDocument();
    });

    it('should render addition problems correctly', () => {
      const problem = createMockProblem({
        questionDisplay: '7 + 8',
        operation: 'addition',
      });

      render(<MathQuestion problem={problem} />);
      expect(screen.getByText('7 + 8')).toBeInTheDocument();
    });

    it('should render subtraction problems correctly', () => {
      const problem = createMockProblem({
        questionDisplay: '15 - 7',
        operation: 'subtraction',
      });

      render(<MathQuestion problem={problem} />);
      expect(screen.getByText('15 - 7')).toBeInTheDocument();
    });

    it('should render multiplication problems correctly', () => {
      const problem = createMockProblem({
        questionDisplay: '5 x 2',
        operation: 'multiplication',
      });

      render(<MathQuestion problem={problem} />);
      expect(screen.getByText('5 x 2')).toBeInTheDocument();
    });

    it('should render missing addend problems correctly', () => {
      const problem = createMockProblem({
        questionDisplay: '? + 5 = 12',
        question: '? + 5 = 12',
        operation: 'missing_addend',
      });

      render(<MathQuestion problem={problem} />);
      expect(screen.getByText('? + 5 = 12')).toBeInTheDocument();
    });
  });

  describe('counting problems', () => {
    it('should render counting problems with emojis', () => {
      const problem = createMockProblem({
        questionDisplay: '🍎🍎🍎',
        question: 'How many 🍎?',
        operation: 'counting',
      });

      render(<MathQuestion problem={problem} />);
      expect(screen.getByText('🍎🍎🍎')).toBeInTheDocument();
      expect(screen.getByText('How many 🍎?')).toBeInTheDocument();
    });

    it('should show question text for counting', () => {
      const problem = createMockProblem({
        questionDisplay: '⭐⭐⭐⭐⭐',
        question: 'How many ⭐?',
        operation: 'counting',
      });

      render(<MathQuestion problem={problem} />);
      expect(screen.getByText('How many ⭐?')).toBeInTheDocument();
    });
  });

  describe('comparison problems', () => {
    it('should render comparison problems', () => {
      const problem = createMockProblem({
        questionDisplay: '5 ○ 8',
        question: 'Which is bigger: 5 or 8?',
        operation: 'comparison',
      });

      render(<MathQuestion problem={problem} />);
      expect(screen.getByText('5 ○ 8')).toBeInTheDocument();
    });
  });

  describe('result feedback', () => {
    it('should apply correct styling when showResult is "correct"', () => {
      const problem = createMockProblem();
      render(<MathQuestion problem={problem} showResult="correct" />);

      const card = document.querySelector('.question-card');
      expect(card).toHaveClass('ring-4', 'ring-[#8DD99B]');
    });

    it('should apply wrong styling when showResult is "wrong"', () => {
      const problem = createMockProblem();
      render(<MathQuestion problem={problem} showResult="wrong" />);

      const card = document.querySelector('.question-card');
      expect(card).toHaveClass('ring-4', 'ring-[#FF9B9B]');
    });

    it('should not apply result styling when showResult is null', () => {
      const problem = createMockProblem();
      render(<MathQuestion problem={problem} showResult={null} />);

      const card = document.querySelector('.question-card');
      expect(card).not.toHaveClass('ring-[#8DD99B]');
      expect(card).not.toHaveClass('ring-[#FF9B9B]');
    });
  });

  describe('card styling', () => {
    it('should have question-card class', () => {
      const problem = createMockProblem();
      render(<MathQuestion problem={problem} />);

      const card = document.querySelector('.question-card');
      expect(card).toBeInTheDocument();
    });

    it('should have proper minimum height', () => {
      const problem = createMockProblem();
      render(<MathQuestion problem={problem} />);

      const card = document.querySelector('.question-card');
      expect(card).toHaveClass('min-h-[140px]');
    });
  });

  describe('problem ID handling', () => {
    it('should use problem id as key for animation', () => {
      const problem1 = createMockProblem({ id: 'problem-1' });
      const { rerender } = render(<MathQuestion problem={problem1} />);

      const problem2 = createMockProblem({ id: 'problem-2' });
      rerender(<MathQuestion problem={problem2} />);

      // The component should animate between different problems
      // This is tested by ensuring no errors occur during rerender
      expect(document.querySelector('.question-card')).toBeInTheDocument();
    });
  });

  describe('text styling', () => {
    it('should apply question-text class to display text', () => {
      const problem = createMockProblem({
        questionDisplay: '3 + 4',
        operation: 'addition',
      });

      render(<MathQuestion problem={problem} />);
      expect(document.querySelector('.question-text')).toBeInTheDocument();
    });

    it('should apply question-equals class to equals sign', () => {
      const problem = createMockProblem({
        operation: 'addition',
      });

      render(<MathQuestion problem={problem} />);
      expect(document.querySelector('.question-equals')).toBeInTheDocument();
    });
  });
});
