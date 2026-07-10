import { getProgressBarSegments, getProgressDescription } from '../utils/progressCalculator.js';

const ProgressBar = ({ level, accuracy, coverage, totalKana, practicedKana, showDetails = false, t }) => {
  const segments = getProgressBarSegments(level);
  const description = getProgressDescription(level, t);
  const label = `${t?.('progress.level') || 'Level'} ${level}/10 – ${description}`;

  return (
    <div className="flex flex-col gap-1">
      {/* Progress Bar */}
      <div
        role="progressbar"
        aria-valuenow={level}
        aria-valuemin={0}
        aria-valuemax={10}
        aria-label={label}
        className="flex gap-1"
      >
        {segments.map((segment, index) => (
          <div
            key={index}
            aria-hidden="true"
            className={`h-2.5 flex-1 rounded-full transition-all duration-300 ${
              segment.active ? 'opacity-100' : 'opacity-25'
            }`}
            style={{ backgroundColor: segment.color }}
          />
        ))}
      </div>

      {/* Details */}
      {showDetails && (
        <div className="text-xs text-slate-500 mt-1">
          <div className="flex justify-between items-center">
            <span className="font-semibold">{description}</span>
            <span>{level}/10</span>
          </div>

          {(accuracy > 0 || coverage > 0) && (
            <div className="flex justify-between text-slate-400 mt-1">
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