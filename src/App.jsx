import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import KanaSelection from './components/KanaSelection';
import LanguageSwitcher from './components/LanguageSwitcher';
import { initializeStatistics } from './utils/statisticsManager.js';
import './i18n/i18n.js';

// #62: only the initial screen ships in the main bundle; the rest are split out.
const KanaQuiz = lazy(() => import('./components/KanaQuiz'));
const QuizResults = lazy(() => import('./components/QuizResults'));
const Statistics = lazy(() => import('./components/Statistics'));
const StudyMode = lazy(() => import('./components/StudyMode'));

// Dezenter Fallback, während ein Screen-Chunk nachgeladen wird.
const ScreenFallback = () => (
  <div className="min-h-screen flex items-center justify-center" aria-hidden="true">
    <div className="h-8 w-8 rounded-full border-2 border-indigo-300 border-t-indigo-600 animate-spin" />
  </div>
);

function App() {
  const { t, i18n } = useTranslation();
  const [currentView, setCurrentView] = useState('selection');
  const [selectedKana, setSelectedKana] = useState([]);
  // Which script(s) the quiz drills; 'both' keeps the legacy behaviour (#72).
  const [scriptMode, setScriptMode] = useState('both');
  const [quizResults, setQuizResults] = useState(null);
  // Marks a back navigation we triggered ourselves, so popstate skips the quiz-leave prompt.
  const intentionalLeaveRef = useRef(false);

  useEffect(() => {
    // Initialize statistics on app load
    initializeStatistics();
  }, []);

  // #14: keep <html lang> in sync so screen readers announce the right language.
  useEffect(() => {
    document.documentElement.lang = i18n.language;
    const handler = (lng) => {
      document.documentElement.lang = lng;
    };
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);

  // #80/#64: popstate is the single source of truth for backward view changes.
  useEffect(() => {
    const handlePopState = (event) => {
      const targetView = event.state?.view ?? 'selection';

      // #64: don't drop quiz progress on browser-back without asking.
      if (currentView === 'quiz' && !intentionalLeaveRef.current) {
        if (!window.confirm(t('quiz.confirmLeave'))) {
          // Re-push the quiz entry so history stack and view stay in sync.
          window.history.pushState({ view: 'quiz' }, '', window.location.pathname);
          return;
        }
      }
      intentionalLeaveRef.current = false;

      setCurrentView(targetView);
      if (targetView === 'selection') {
        setSelectedKana([]);
        setQuizResults(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView, t]);

  // Forward navigation: add a history entry so browser-back has somewhere to go.
  const navigateTo = (view) => {
    window.history.pushState({ view }, '', window.location.pathname);
    setCurrentView(view);
  };

  const handleStartQuiz = (kanaList, options = {}) => {
    setSelectedKana(kanaList);
    setScriptMode(options.scriptMode ?? 'both');
    navigateTo('quiz');
  };

  // #4: study the picked kana as flashcards before quizzing.
  const handleStartStudy = (kanaList, options = {}) => {
    setSelectedKana(kanaList);
    setScriptMode(options.scriptMode ?? 'both');
    navigateTo('study');
  };

  const handleQuizFinish = (results) => {
    if (results === null) {
      // In-quiz "back to selection": leave via history, without a redundant prompt.
      intentionalLeaveRef.current = true;
      window.history.back();
    } else {
      // Quiz done: swap the quiz entry for results, so Back returns to selection.
      setQuizResults(results);
      window.history.replaceState({ view: 'results' }, '', window.location.pathname);
      setCurrentView('results');
    }
  };

  // From study straight into the quiz: swap the study entry for a quiz entry so
  // browser-back returns to the selection screen, matching the direct-quiz flow.
  const handleStudyStartQuiz = (kanaList, options = {}) => {
    if (kanaList) {
      setSelectedKana(kanaList);
      setScriptMode(options.scriptMode ?? 'both');
    }
    window.history.replaceState({ view: 'quiz' }, '', window.location.pathname);
    setCurrentView('quiz');
  };

  const handleRestart = () => {
    // Play again: swap the results entry back to a fresh quiz entry.
    window.history.replaceState({ view: 'quiz' }, '', window.location.pathname);
    setCurrentView('quiz');
  };

  const handleNewSelection = () => {
    window.history.back();
  };

  const handleViewStatistics = () => {
    navigateTo('statistics');
  };

  const handleBackToSelection = () => {
    window.history.back();
  };

  return (
    <div className="App pb-16">
      <LanguageSwitcher />

      {currentView === 'selection' && (
        <KanaSelection
          onStartQuiz={handleStartQuiz}
          onStudy={handleStartStudy}
          onViewStatistics={handleViewStatistics}
        />
      )}

      <Suspense fallback={<ScreenFallback />}>
        {currentView === 'study' && (
          <StudyMode
            kanaList={selectedKana}
            scriptMode={scriptMode}
            onStartQuiz={handleStudyStartQuiz}
            onBack={handleBackToSelection}
          />
        )}

        {currentView === 'quiz' && (
          <KanaQuiz
            kanaList={selectedKana}
            scriptMode={scriptMode}
            onFinish={handleQuizFinish}
          />
        )}

        {currentView === 'results' && (
          <QuizResults
            results={quizResults}
            onRestart={handleRestart}
            onNewSelection={handleNewSelection}
          />
        )}

        {currentView === 'statistics' && (
          <Statistics onBack={handleBackToSelection} />
        )}
      </Suspense>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-50/90 to-indigo-100/90 backdrop-blur-sm border-t border-indigo-200/50 py-2">
        <div className="text-center text-sm text-gray-700">
          {t('footer.madeWithLove')} 💖 - <a
            href="https://malura.de"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            michael
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
