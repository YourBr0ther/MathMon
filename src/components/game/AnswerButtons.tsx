import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';

interface AnswerButtonsProps {
  options: number[];
  onAnswer: (answer: number) => void;
  disabled?: boolean;
  correctAnswer?: number;
  selectedAnswer?: number | null;
  showCorrect?: boolean;
}

export const AnswerButtons = memo(function AnswerButtons({
  options,
  onAnswer,
  disabled = false,
  correctAnswer,
  selectedAnswer,
  showCorrect = false,
}: AnswerButtonsProps) {
  const getButtonClass = (option: number) => {
    if (!showCorrect || selectedAnswer === null) {
      return 'answer-btn-kawaii';
    }

    if (option === correctAnswer) {
      return 'answer-btn-kawaii answer-btn-correct';
    }

    if (option === selectedAnswer && option !== correctAnswer) {
      return 'answer-btn-kawaii answer-btn-wrong';
    }

    return 'answer-btn-kawaii opacity-50';
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-xs sm:max-w-md mx-auto px-1 sm:px-2">
      {options.map((option, index) => (
        <motion.button
          key={`${option}-${index}`}
          onClick={() => !disabled && onAnswer(option)}
          disabled={disabled}
          className={`
            ${getButtonClass(option)}
            ${disabled && !showCorrect ? 'cursor-not-allowed' : 'cursor-pointer'}
            flex items-center justify-center
          `}
          whileHover={!disabled ? { scale: 1.03, y: -3 } : undefined}
          whileTap={!disabled ? { scale: 0.97, y: 2 } : undefined}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: index * 0.08,
            type: 'spring',
            stiffness: 300,
            damping: 20
          }}
        >
          {option}
        </motion.button>
      ))}
    </div>
  );
});
