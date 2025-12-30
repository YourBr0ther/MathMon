import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/testUtils';
import { AnswerButtons } from './AnswerButtons';

describe('AnswerButtons', () => {
  const defaultProps = {
    options: [5, 7, 8, 10],
    onAnswer: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render all options as buttons', () => {
      render(<AnswerButtons {...defaultProps} />);

      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should render correct number of buttons', () => {
      render(<AnswerButtons {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4);
    });

    it('should handle different option values', () => {
      render(<AnswerButtons options={[0, 1, 100, 999]} onAnswer={vi.fn()} />);

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('999')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onAnswer with correct value when clicked', () => {
      const onAnswer = vi.fn();
      render(<AnswerButtons options={[5, 7, 8, 10]} onAnswer={onAnswer} />);

      fireEvent.click(screen.getByText('8'));
      expect(onAnswer).toHaveBeenCalledWith(8);
    });

    it('should call onAnswer for each different button', () => {
      const onAnswer = vi.fn();
      render(<AnswerButtons options={[1, 2, 3, 4]} onAnswer={onAnswer} />);

      fireEvent.click(screen.getByText('1'));
      expect(onAnswer).toHaveBeenCalledWith(1);

      fireEvent.click(screen.getByText('3'));
      expect(onAnswer).toHaveBeenCalledWith(3);

      expect(onAnswer).toHaveBeenCalledTimes(2);
    });

    it('should not call onAnswer when disabled', () => {
      const onAnswer = vi.fn();
      render(<AnswerButtons options={[5, 7, 8, 10]} onAnswer={onAnswer} disabled />);

      fireEvent.click(screen.getByText('8'));
      expect(onAnswer).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('should disable all buttons when disabled prop is true', () => {
      render(<AnswerButtons {...defaultProps} disabled />);
      const buttons = screen.getAllByRole('button');

      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    it('should have correct cursor style when disabled', () => {
      render(<AnswerButtons {...defaultProps} disabled />);
      const buttons = screen.getAllByRole('button');

      buttons.forEach(button => {
        expect(button).toHaveClass('cursor-not-allowed');
      });
    });
  });

  describe('answer feedback (showCorrect)', () => {
    it('should apply correct styling to correct answer', () => {
      render(
        <AnswerButtons
          options={[5, 7, 8, 10]}
          onAnswer={vi.fn()}
          correctAnswer={8}
          selectedAnswer={8}
          showCorrect
        />
      );

      const correctButton = screen.getByText('8');
      expect(correctButton).toHaveClass('answer-btn-correct');
    });

    it('should apply wrong styling to incorrect selected answer', () => {
      render(
        <AnswerButtons
          options={[5, 7, 8, 10]}
          onAnswer={vi.fn()}
          correctAnswer={8}
          selectedAnswer={5}
          showCorrect
        />
      );

      const wrongButton = screen.getByText('5');
      expect(wrongButton).toHaveClass('answer-btn-wrong');
    });

    it('should dim non-selected incorrect options', () => {
      render(
        <AnswerButtons
          options={[5, 7, 8, 10]}
          onAnswer={vi.fn()}
          correctAnswer={8}
          selectedAnswer={5}
          showCorrect
        />
      );

      // Buttons 7 and 10 should be dimmed
      const button7 = screen.getByText('7');
      const button10 = screen.getByText('10');

      expect(button7).toHaveClass('opacity-50');
      expect(button10).toHaveClass('opacity-50');
    });

    it('should still show correct answer highlighted when wrong answer selected', () => {
      render(
        <AnswerButtons
          options={[5, 7, 8, 10]}
          onAnswer={vi.fn()}
          correctAnswer={8}
          selectedAnswer={5}
          showCorrect
        />
      );

      const correctButton = screen.getByText('8');
      expect(correctButton).toHaveClass('answer-btn-correct');
    });

    it('should not show feedback when showCorrect is false', () => {
      render(
        <AnswerButtons
          options={[5, 7, 8, 10]}
          onAnswer={vi.fn()}
          correctAnswer={8}
          selectedAnswer={5}
          showCorrect={false}
        />
      );

      const wrongButton = screen.getByText('5');
      expect(wrongButton).not.toHaveClass('answer-btn-wrong');
      expect(wrongButton).not.toHaveClass('answer-btn-correct');
    });

    it('should not show feedback when selectedAnswer is null', () => {
      render(
        <AnswerButtons
          options={[5, 7, 8, 10]}
          onAnswer={vi.fn()}
          correctAnswer={8}
          selectedAnswer={null}
          showCorrect
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toHaveClass('answer-btn-wrong');
        expect(button).not.toHaveClass('answer-btn-correct');
      });
    });
  });

  describe('styling', () => {
    it('should apply base kawaii button styling', () => {
      render(<AnswerButtons {...defaultProps} />);
      const buttons = screen.getAllByRole('button');

      buttons.forEach(button => {
        expect(button).toHaveClass('answer-btn-kawaii');
      });
    });

    it('should have grid layout', () => {
      render(<AnswerButtons {...defaultProps} />);
      const container = screen.getAllByRole('button')[0].parentElement;
      expect(container).toHaveClass('grid', 'grid-cols-2');
    });
  });

  describe('edge cases', () => {
    it('should handle duplicate values in options', () => {
      render(<AnswerButtons options={[5, 5, 8, 8]} onAnswer={vi.fn()} />);
      // Should still render 4 buttons due to key using index
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4);
    });

    it('should handle zero as an option', () => {
      const onAnswer = vi.fn();
      render(<AnswerButtons options={[0, 1, 2, 3]} onAnswer={onAnswer} />);

      fireEvent.click(screen.getByText('0'));
      expect(onAnswer).toHaveBeenCalledWith(0);
    });

    it('should handle large numbers', () => {
      render(<AnswerButtons options={[100, 200, 300, 400]} onAnswer={vi.fn()} />);

      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('400')).toBeInTheDocument();
    });
  });
});
