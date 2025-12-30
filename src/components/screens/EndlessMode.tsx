import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { MathProblem, Pokemon, Screen } from '../../types';
import { generateProblemByDifficulty } from '../../utils/mathGenerator';
import { getEncouragingMessage, getStrategyHint } from '../../utils/feedbackHelpers';
import { fetchPokemon, playPokemonCry } from '../../utils/pokemonApi';
import { getRandomPokemonId, getStarterPokemonId } from '../../data/pokemonConfig';
import { MathQuestion } from '../game/MathQuestion';
import { AnswerButtons } from '../game/AnswerButtons';
import { StreakCounter, StreakMilestone } from '../game/StreakCounter';
import { CatchAnimation } from '../game/CatchAnimation';
import { CatchProgress } from '../common/ProgressBar';
import { PokemonSprite } from '../common/PokemonSprite';
import { IconButton } from '../common/Button';

interface EndlessModeProps {
  highestStreak: number;
  totalCatches: number;
  onCatchPokemon: (pokemon: Pokemon, problemText: string) => void;
  onUpdateStreak: (streak: number) => void;
  onRecordAnswer: (correct: boolean) => void;
  onNavigate: (screen: Screen) => void;
  playSound: (sound: 'correct' | 'wrong' | 'catch' | 'streak') => void;
}

export function EndlessMode({
  highestStreak,
  totalCatches,
  onCatchPokemon,
  onUpdateStreak,
  onRecordAnswer,
  onNavigate,
  playSound,
}: EndlessModeProps) {
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [currentPokemon, setCurrentPokemon] = useState<Pokemon | null>(null);
  const [streak, setStreak] = useState(0);
  const [difficulty, setDifficulty] = useState(1); // Track difficulty separately for gentler drops
  const [correctInRow, setCorrectInRow] = useState(0);
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showCatchAnimation, setShowCatchAnimation] = useState(false);
  const [caughtPokemon, setCaughtPokemon] = useState<Pokemon | null>(null);
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneStreak, setMilestoneStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackHint, setFeedbackHint] = useState<{ message: string; hint: string } | null>(null);

  // Generate new problem
  const generateNewProblem = useCallback(() => {
    const problem = generateProblemByDifficulty(difficulty);
    setCurrentProblem(problem);
    setShowResult(null);
    setSelectedAnswer(null);
    setFeedbackHint(null);
  }, [difficulty]);

  // Load a new Pokemon to catch
  const loadNewPokemon = useCallback(async () => {
    setIsLoading(true);
    try {
      // First few catches are starters
      const pokemonId = totalCatches < 4
        ? getStarterPokemonId(totalCatches)
        : getRandomPokemonId(difficulty);
      const pokemon = await fetchPokemon(pokemonId);
      setCurrentPokemon(pokemon);
    } catch (error) {
      console.error('Failed to load Pokemon:', error);
    } finally {
      setIsLoading(false);
    }
  }, [difficulty, totalCatches]);

  // Initialize game
  useEffect(() => {
    generateNewProblem();
    loadNewPokemon();
  }, []);

  // Handle answer selection
  const handleAnswer = useCallback(async (answer: number) => {
    if (!currentProblem || showResult) return;

    setSelectedAnswer(answer);
    const isCorrect = answer === currentProblem.answer;

    if (isCorrect) {
      playSound('correct');
      setShowResult('correct');
      const newStreak = streak + 1;
      setStreak(newStreak);
      onUpdateStreak(newStreak);
      onRecordAnswer(true);

      const newCorrectInRow = correctInRow + 1;
      setCorrectInRow(newCorrectInRow);

      // Increase difficulty every 5 correct answers (max 10)
      if (newStreak % 5 === 0 && difficulty < 10) {
        setDifficulty(prev => Math.min(10, prev + 1));
      }

      // Check for milestone
      if ([5, 10, 25, 50, 100].includes(newStreak)) {
        setMilestoneStreak(newStreak);
        setShowMilestone(true);
        playSound('streak');
        setTimeout(() => setShowMilestone(false), 2000);
      }

      // Check if Pokemon is caught (5 correct answers)
      if (newCorrectInRow >= 5 && currentPokemon) {
        setTimeout(() => {
          setCaughtPokemon(currentPokemon);
          setShowCatchAnimation(true);
          playSound('catch');
          playPokemonCry(currentPokemon.id);
          onCatchPokemon(currentPokemon, currentProblem.question);
          setCorrectInRow(0);
        }, 500);
      } else {
        // Generate next problem after a short delay
        setTimeout(() => {
          generateNewProblem();
        }, 800);
      }
    } else {
      playSound('wrong');
      setShowResult('wrong');
      onRecordAnswer(false);

      // Gentler difficulty drop: only decrease by 1 level (minimum 1)
      setDifficulty(prev => Math.max(1, prev - 1));

      // Reset streak but keep some progress feel
      setStreak(0);
      setCorrectInRow(0);
      onUpdateStreak(0);

      // Show encouraging feedback with strategy hint
      setFeedbackHint({
        message: getEncouragingMessage(),
        hint: getStrategyHint(currentProblem),
      });

      // Show feedback longer, then generate new problem
      setTimeout(() => {
        generateNewProblem();
      }, 2500);
    }
  }, [currentProblem, currentPokemon, streak, difficulty, correctInRow, showResult, generateNewProblem, onCatchPokemon, onUpdateStreak, onRecordAnswer, playSound]);

  // Handle catch animation complete
  const handleCatchComplete = useCallback(() => {
    setShowCatchAnimation(false);
    setCaughtPokemon(null);
    loadNewPokemon();
    generateNewProblem();
  }, [loadNewPokemon, generateNewProblem]);

  return (
    <div className="min-h-screen flex flex-col page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <IconButton
          icon={<ArrowLeft className="w-5 h-5 text-[#6B5B7A]" />}
          onClick={() => onNavigate('home')}
          ariaLabel="Go back"
          variant="ghost"
        />
        <StreakCounter streak={streak} highestStreak={highestStreak} />
        <div className="w-10 sm:w-12" /> {/* Spacer for alignment */}
      </div>

      {/* Pokemon Preview */}
      <div className="flex justify-center mb-3 sm:mb-4">
        {isLoading ? (
          <div className="pokemon-container w-24 h-24 sm:w-28 sm:h-28 animate-pulse">
            <div className="w-full h-full rounded-full bg-white/50" />
          </div>
        ) : currentPokemon ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative"
          >
            <div className="pokemon-container border-[#FFADC6]">
              <PokemonSprite
                pokemon={currentPokemon}
                size="large"
                animated
                showName
              />
            </div>
            {/* Catch progress dots */}
            <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 transform -translate-x-1/2">
              <CatchProgress correctCount={correctInRow} />
            </div>
          </motion.div>
        ) : null}
      </div>

      {/* Catch progress text */}
      <AnimatePresence>
        {correctInRow > 0 && correctInRow < 5 && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center title-sub text-sm sm:text-base mb-3 sm:mb-4 mt-1 sm:mt-2"
          >
            {5 - correctInRow} more to catch {currentPokemon?.name}!
          </motion.p>
        )}
      </AnimatePresence>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 sm:gap-6">
        {currentProblem && (
          <>
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
          </>
        )}
      </div>

      {/* Difficulty indicator */}
      <div className="mt-3 sm:mt-4 text-center">
        <span className="level-badge text-xs sm:text-sm">
          Level {difficulty} •{' '}
          {difficulty <= 2 ? 'Kindergarten' : difficulty <= 6 ? '1st Grade' : '2nd Grade'}
        </span>
      </div>

      {/* Catch Animation Overlay */}
      <CatchAnimation
        pokemon={caughtPokemon}
        isVisible={showCatchAnimation}
        onComplete={handleCatchComplete}
      />

      {/* Streak Milestone */}
      <StreakMilestone
        streak={milestoneStreak}
        isVisible={showMilestone}
      />
    </div>
  );
}
