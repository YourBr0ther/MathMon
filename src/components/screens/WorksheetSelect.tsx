import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Screen, GradeLevel, Worksheet } from '../../types';
import { WORKSHEETS, getGradeLevelName, getGradeLevelColor } from '../../data/worksheets';
import { IconButton } from '../common/Button';

interface WorksheetSelectProps {
  onNavigate: (screen: Screen) => void;
  onSelectWorksheet: (worksheet: Worksheet) => void;
}

export function WorksheetSelect({ onNavigate, onSelectWorksheet }: WorksheetSelectProps) {
  const gradeLevels: GradeLevel[] = ['kindergarten', 'first', 'second'];

  return (
    <div className="min-h-screen flex flex-col page-container">
      {/* Header */}
      <div className="flex items-center mb-4 sm:mb-6">
        <IconButton
          icon={<ArrowLeft className="w-5 h-5 text-[#6B5B7A]" />}
          onClick={() => onNavigate('home')}
          ariaLabel="Go back"
          variant="ghost"
        />
        <h1 className="title-main text-xl sm:text-2xl ml-3 sm:ml-4">Trainer Academy</h1>
      </div>

      {/* Subtitle */}
      <p className="title-sub text-sm sm:text-base text-center mb-4 sm:mb-6">
        Choose a worksheet to practice!
      </p>

      {/* Worksheets by Grade */}
      <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6">
        {gradeLevels.map((grade, gradeIndex) => {
          const worksheets = WORKSHEETS.filter(w => w.gradeLevel === grade);
          const color = getGradeLevelColor(grade);

          return (
            <motion.div
              key={grade}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: gradeIndex * 0.1 }}
            >
              {/* Grade Header */}
              <div
                className="px-3 sm:px-4 py-2 rounded-t-2xl text-white font-display font-bold text-base sm:text-lg"
                style={{ backgroundColor: color }}
              >
                {getGradeLevelName(grade)}
              </div>

              {/* Worksheet Cards */}
              <div className="game-card rounded-t-none p-2 sm:p-3 grid grid-cols-2 gap-2 sm:gap-3">
                {worksheets.map((worksheet) => (
                  <button
                    key={worksheet.id}
                    onClick={() => onSelectWorksheet(worksheet)}
                    className="worksheet-card text-left p-3 sm:p-4"
                  >
                    <div className="worksheet-icon text-2xl sm:text-3xl mb-1.5 sm:mb-2">{worksheet.icon}</div>
                    <h3 className="font-display font-bold text-[#5D4E60] text-xs sm:text-sm">
                      {worksheet.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-[#8B7A9E] mt-0.5 sm:mt-1 line-clamp-2">
                      {worksheet.description}
                    </p>
                    <p className="text-[10px] sm:text-xs text-[#B8A8C8] mt-1.5 sm:mt-2">
                      {worksheet.problemCount} problems
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
