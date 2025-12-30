import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Screen, Worksheet, MathProblem, WorksheetResult, Pokemon } from '../../types';
import { generateWorksheet } from '../../utils/mathGenerator';
import { getEncouragingMessage, getStrategyHint } from '../../utils/feedbackHelpers';
import { fetchPokemon, playPokemonCry } from '../../utils/pokemonApi';
import { getRandomPokemonId } from '../../data/pokemonConfig';
import { MathQuestion } from '../game/MathQuestion';
import { AnswerButtons } from '../game/AnswerButtons';
import { ProgressBar } from '../common/ProgressBar';
import { IconButton, Button } from '../common/Button';
import { PokemonSprite } from '../common/PokemonSprite';

interface WorksheetModeProps {
  worksheet: Worksheet;
  onComplete: (result: WorksheetResult) => void;
  onCatchPokemon: (pokemon: Pokemon, problemText: string) => void;
  onRecordAnswer: (correct: boolean) => void;
  onNavigate: (screen: Screen) => void;
  playSound: (sound: 'correct' | 'wrong' | 'catch' | 'victory') => void;
}

export function WorksheetMode({
  worksheet,
  onComplete,
  onCatchPokemon,
  onRecordAnswer,
  onNavigate,
  playSound,
}: WorksheetModeProps) {
  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [startTime] = useState(Date.now());
  const [isComplete, setIsComplete] = useState(false);
  const [rewardPokemon, setRewardPokemon] = useState<Pokemon | null>(null);
  const [celebrationEmoji, setCelebrationEmoji] = useState<string>('');
  const [feedbackHint, setFeedbackHint] = useState<{ message: string; hint: string } | null>(null);

  // Fun emojis for correct answers
  const celebrationEmojis = ['🎉', '⭐', '🌟', '✨', '💫', '🎊', '🥳', '👏', '💪', '🔥'];

  // Generate problems on mount
  useEffect(() => {
    const generatedProblems = generateWorksheet(
      worksheet.gradeLevel,
      worksheet.operation,
      worksheet.problemCount
    );
    setProblems(generatedProblems);
  }, [worksheet]);

  // Load reward Pokemon when complete
  useEffect(() => {
    if (isComplete) {
      const loadReward = async () => {
        const id = getRandomPokemonId(5);
        const pokemon = await fetchPokemon(id);
        setRewardPokemon(pokemon);
      };
      loadReward();
    }
  }, [isComplete]);

  const currentProblem = problems[currentIndex];

  const handleAnswer = useCallback((answer: number) => {
    if (!currentProblem || showResult) return;

    setSelectedAnswer(answer);
    const isCorrect = answer === currentProblem.answer;

    if (isCorrect) {
      playSound('correct');
      setShowResult('correct');
      setCorrectCount(prev => prev + 1);
      onRecordAnswer(true);
      setFeedbackHint(null);

      // Show celebration emoji
      const emoji = celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)];
      setCelebrationEmoji(emoji);
    } else {
      playSound('wrong');
      setShowResult('wrong');
      onRecordAnswer(false);

      // Show encouraging feedback with strategy hint
      setFeedbackHint({
        message: getEncouragingMessage(),
        hint: getStrategyHint(currentProblem),
      });
    }

    // Move to next problem or complete (longer delay for wrong answers to read hint)
    const delay = isCorrect ? 1200 : 2500;
    setTimeout(() => {
      setCelebrationEmoji('');
      setFeedbackHint(null);
      if (currentIndex + 1 >= problems.length) {
        // Worksheet complete!
        const endTime = Date.now();
        const timeSeconds = Math.floor((endTime - startTime) / 1000);
        const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
        const stars = calculateStars(finalCorrect, problems.length);

        playSound('victory');
        setIsComplete(true);

        const result: WorksheetResult = {
          worksheetId: worksheet.id,
          completedAt: new Date(),
          correctAnswers: finalCorrect,
          totalProblems: problems.length,
          stars,
          timeSeconds,
        };
        onComplete(result);
      } else {
        setCurrentIndex(prev => prev + 1);
        setShowResult(null);
        setSelectedAnswer(null);
      }
    }, delay);
  }, [currentProblem, currentIndex, problems.length, correctCount, showResult, startTime, worksheet.id, onComplete, onRecordAnswer, playSound]);

  const calculateStars = (correct: number, total: number): number => {
    const percentage = (correct / total) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  const handleClaimReward = () => {
    if (rewardPokemon) {
      playSound('catch');
      playPokemonCry(rewardPokemon.id);
      onCatchPokemon(rewardPokemon, `${worksheet.name} reward!`);
    }
    onNavigate('worksheetSelect');
  };

  // Completion Screen
  if (isComplete) {
    const stars = calculateStars(correctCount, problems.length);
    const percentage = Math.round((correctCount / problems.length) * 100);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="game-card p-8 w-full max-w-sm text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl mb-4"
          >
            {stars === 3 ? '🏆' : stars === 2 ? '🎉' : stars === 1 ? '👍' : '💪'}
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {stars === 3 ? 'Perfect!' : stars >= 2 ? 'Great Job!' : 'Keep Trying!'}
          </h2>

          {/* Stars */}
          <div className="flex justify-center gap-2 my-4">
            {[1, 2, 3].map((star) => (
              <motion.span
                key={star}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: star * 0.2, type: 'spring' }}
                className={`text-4xl ${star <= stars ? '' : 'opacity-30'}`}
              >
                ⭐
              </motion.span>
            ))}
          </div>

          <div className="bg-gray-100 rounded-xl p-4 mb-6">
            <p className="text-lg">
              <span className="font-bold text-success">{correctCount}</span>
              <span className="text-gray-500"> / {problems.length} correct</span>
            </p>
            <p className="text-sm text-gray-500">{percentage}% accuracy</p>
          </div>

          {/* Reward Pokemon */}
          {rewardPokemon && stars >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6"
            >
              <p className="text-sm text-gray-500 mb-2">You earned:</p>
              <PokemonSprite
                pokemon={rewardPokemon}
                size="large"
                showName
                animated
                useArtwork
              />
            </motion.div>
          )}

          <Button onClick={handleClaimReward} fullWidth>
            {rewardPokemon && stars >= 2 ? 'Claim Pokemon!' : 'Continue'}
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <IconButton
          icon={<span className="text-2xl">←</span>}
          onClick={() => onNavigate('worksheetSelect')}
          ariaLabel="Go back"
          variant="ghost"
        />
        <div className="text-center">
          <h1 className="text-lg font-bold text-white">{worksheet.name}</h1>
          <p className="text-white/70 text-sm">
            {currentIndex + 1} of {problems.length}
          </p>
        </div>
        <div className="w-12" />
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <ProgressBar
          current={currentIndex + 1}
          max={problems.length}
          color="#FFCB05"
          height="medium"
        />
      </div>

      {/* Score */}
      <div className="flex justify-center mb-4">
        <div className="bg-white/20 backdrop-blur rounded-full px-4 py-2">
          <span className="text-white font-bold">
            ✅ {correctCount}
          </span>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 relative">
        {/* Celebration Emoji */}
        <AnimatePresence>
          {celebrationEmoji && (
            <motion.div
              initial={{ scale: 0, y: 0 }}
              animate={{ scale: 1.5, y: -50 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-0 text-6xl z-10"
            >
              {celebrationEmoji}
            </motion.div>
          )}
        </AnimatePresence>

        <MathQuestion
          problem={currentProblem}
          showResult={showResult}
        />

        {/* Feedback hint on wrong answer */}
        <AnimatePresence>
          {feedbackHint && showResult === 'wrong' && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="bg-white/95 backdrop-blur rounded-2xl px-4 py-3 shadow-lg border-2 border-[#E0C3FC] max-w-xs sm:max-w-sm text-center"
            >
              <p className="text-[#6B5B7A] font-medium text-sm sm:text-base mb-1">
                {feedbackHint.message}
              </p>
              <p className="text-[#8B7A9E] text-xs sm:text-sm">
                {feedbackHint.hint}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnswerButtons
          options={currentProblem.options}
          onAnswer={handleAnswer}
          disabled={showResult !== null}
          correctAnswer={currentProblem.answer}
          selectedAnswer={selectedAnswer}
          showCorrect={showResult !== null}
        />
      </div>
    </div>
  );
}
