import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Heart } from 'lucide-react';
import { MathProblem } from '../../types';

interface MathQuestionProps {
  problem: MathProblem;
  showResult?: 'correct' | 'wrong' | null;
}

export const MathQuestion = memo(function MathQuestion({ problem, showResult }: MathQuestionProps) {
  const isCountingProblem = problem.operation === 'counting';
  const isComparisonProblem = problem.operation === 'comparison';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={problem.id}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`
          question-card
          flex flex-col items-center justify-center
          min-h-[140px] sm:min-h-[160px] w-full max-w-xs sm:max-w-md mx-auto
          p-4 sm:p-6
          ${showResult === 'correct' ? 'ring-4 ring-[#8DD99B] animate-pop-in' : ''}
          ${showResult === 'wrong' ? 'ring-4 ring-[#FF9B9B]' : ''}
        `}
      >
        {isCountingProblem ? (
          <div className="flex flex-col items-center gap-2 sm:gap-4">
            <span className="text-3xl sm:text-4xl md:text-5xl tracking-wider">
              {problem.questionDisplay}
            </span>
            <span className="text-base sm:text-lg text-[#8B7A9E] font-medium">{problem.question}</span>
          </div>
        ) : isComparisonProblem ? (
          <div className="flex flex-col items-center gap-2 sm:gap-4">
            <span className="text-base sm:text-lg text-[#8B7A9E] font-medium">{problem.question}</span>
            <span className="question-text text-3xl sm:text-4xl">
              {problem.questionDisplay}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="question-text text-2xl sm:text-3xl">
              {problem.questionDisplay}
            </span>
            <span className="question-equals text-xl sm:text-2xl">
              = ?
            </span>
          </div>
        )}

        {/* Result feedback */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0, rotate: -20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="absolute top-3 right-3"
            >
              {showResult === 'correct' ? (
                <Sparkles className="w-8 h-8 text-[#FFCA28] fill-[#FFE082] animate-heart-beat" />
              ) : (
                <Star className="w-8 h-8 text-[#E0C3FC]" />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative sparkles on correct */}
        <AnimatePresence>
          {showResult === 'correct' && (
            <>
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.1 }}
                className="absolute top-2 left-4"
              >
                <Star className="w-5 h-5 text-[#FFE082] fill-[#FFE082]" />
              </motion.span>
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute bottom-4 right-6"
              >
                <Heart className="w-4 h-4 text-[#FFADC6] fill-[#FFADC6]" />
              </motion.span>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
});
