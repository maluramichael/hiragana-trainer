import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import KanaSelection from './components/KanaSelection';
import LandingPage from './components/LandingPage';
import { initializeStatistics } from './utils/statisticsManager.js';
import { kanaGroups } from './data/kana.js';
import './i18n/i18n.js';

// #62: only the initial screen ships in the main bundle; the rest are split out.
const KanaQuiz = lazy(() => import('./components/KanaQuiz'));
const QuizResults = lazy(() => import('./components/QuizResults'));
const Statistics = lazy(() => import('./components/Statistics'));
const StudyMode = lazy(() => import('./components/StudyMode'));

// Dezenter Fallback, während ein Screen-Chunk nachgeladen wird.
const ScreenFallback = () => (
  <div className="min-h-screen flex items-center justify-center" aria-hidden="true">
    <div className="h-9 w-9 rounded-full border-[3px] border-pink-200 border-t-fuchsia-500 animate-spin" />
  </div>
);

function App() {
  const { t, i18n } = useTranslation();
  // #landing: the app opens on a marketing landing page; the primary CTA jumps
  // straight into the quiz, a secondary link leads to the full picker.
  const [currentView, setCurrentView] = useState('landing');
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
      const targetView = event.state?.view ?? 'landing';

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
      if (targetView === 'selection' || targetView === 'landing') {
        setSelectedKana([]);
        setQuizResults(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView, t]);

  // Forward-navigating back onto the results entry (browser-forward after leaving
  // results) lands here without result data — it was cleared on the way out.
  // There is nothing to show, so fall back to the selection screen instead of
  // rendering QuizResults with a null `results` (which would crash on results.total).
  useEffect(() => {
    if (currentView === 'results' && !quizResults) {
      window.history.replaceState({ view: 'selection' }, '', window.location.pathname);
      setCurrentView('selection');
    }
  }, [currentView, quizResults]);

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

  // Landing CTA: one click jumps straight into a quiz on the five hiragana
  // vowels, the natural first thing a learner drills. Seed a selection entry
  // behind the quiz first, so "back to selection" and "choose different
  // characters" land on the picker instead of bouncing to the landing page.
  const handleStartFromLanding = () => {
    window.history.pushState({ view: 'selection' }, '', window.location.pathname);
    handleStartQuiz(kanaGroups.basic.vowels.hiragana, { scriptMode: 'hiragana' });
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
    <div className="App">
      {currentView === 'landing' && (
        <LandingPage
          onStart={handleStartFromLanding}
          onChooseCharacters={() => navigateTo('selection')}
        />
      )}

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

        {currentView === 'results' && quizResults && (
          <QuizResults
            results={quizResults}
            kanaList={selectedKana}
            onRestart={handleRestart}
            onNewSelection={handleNewSelection}
          />
        )}

        {currentView === 'statistics' && (
          <Statistics onBack={handleBackToSelection} />
        )}
      </Suspense>
    </div>
  );
}

export default App;
