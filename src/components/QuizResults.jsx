import { useTranslation } from 'react-i18next';

const QuizResults = ({ results, onRestart, onNewSelection }) => {
  const { t } = useTranslation();
  const accuracy = results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0;
  
  const getPerformanceMessage = () => {
    if (accuracy >= 95) return { message: t('results.perfect'), color: "text-green-600" };
    if (accuracy >= 80) return { message: t('results.excellent'), color: "text-blue-600" };
    if (accuracy >= 65) return { message: t('results.good'), color: "text-yellow-600" };
    return { message: t('results.keepPracticing'), color: "text-red-600" };
  };

  const performance = getPerformanceMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('results.title')}</h1>
          
          <div className={`text-2xl font-semibold mb-8 ${performance.color}`}>
            {performance.message}
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">{results.correct}</div>
              <div className="text-gray-600">{t('results.correctAnswers')}</div>
              <div className="text-sm text-gray-500">{t('results.outOf')} {results.total}</div>
            </div>
            
            <div className="bg-purple-50 rounded-xl p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">{accuracy}%</div>
              <div className="text-gray-600">{t('quiz.accuracy')}</div>
            </div>
            
            <div className="bg-green-50 rounded-xl p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">{results.bestStreak}</div>
              <div className="text-gray-600">{t('results.bestStreak')}</div>
            </div>
            
            <div className="bg-yellow-50 rounded-xl p-6">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{results.total - results.correct}</div>
              <div className="text-gray-600">{t('results.incorrect')}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={onRestart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all hover:scale-105 shadow-lg"
            >
              {t('results.practiceSame')}
            </button>
            
            <button
              onClick={onNewSelection}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all hover:scale-105 shadow-lg"
            >
              {t('results.chooseDifferent')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;