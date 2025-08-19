import { getProgressBarSegments, getProgressDescription } from '../utils/progressCalculator.js';

const ProgressBar = ({ level, accuracy, coverage, totalKana, practicedKana, showDetails = false, t }) => {
  const segments = getProgressBarSegments(level);
  const description = getProgressDescription(level, t);

  return (
    <div className="flex flex-col gap-1">
      {/* Progress Bar */}
      <div className="flex gap-1">
        {segments.map((segment, index) => (
          <div
            key={index}
            className={`h-2 flex-1 rounded-sm transition-colors duration-300 ${
              segment.active ? 'opacity-100' : 'opacity-30'
            }`}
            style={{ backgroundColor: segment.color }}
          />
        ))}
      </div>
      
      {/* Details */}
      {showDetails && (
        <div className="text-xs text-gray-600 mt-1">
          <div className="flex justify-between items-center">
            <span className="font-medium">{description}</span>
            <span>{level}/10</span>
          </div>
          
          {(accuracy > 0 || coverage > 0) && (
            <div className="flex justify-between text-gray-500 mt-1">
              <span>{accuracy}% {t?.('progress.accuracy') || 'accuracy'}</span>
              <span>{practicedKana}/{totalKana} {t?.('progress.practiced') || 'practiced'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;