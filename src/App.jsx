import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import KanaSelection from './components/KanaSelection';
import KanaQuiz from './components/KanaQuiz';
import QuizResults from './components/QuizResults';
import Statistics from './components/Statistics';
import LanguageSwitcher from './components/LanguageSwitcher';
import { initializeStatistics } from './utils/statisticsManager.js';
import './i18n/i18n.js';

function App() {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState('selection');
  const [selectedKana, setSelectedKana] = useState([]);
  const [quizResults, setQuizResults] = useState(null);

  useEffect(() => {
    // Initialize statistics on app load
    initializeStatistics();
  }, []);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event) => {
      if (currentView === 'quiz') {
        setCurrentView('selection');
        setSelectedKana([]);
        setQuizResults(null);
      } else if (currentView === 'results') {
        setCurrentView('selection');
        setSelectedKana([]);
        setQuizResults(null);
      } else if (currentView === 'statistics') {
        setCurrentView('selection');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Add history entry for current view
    if (currentView !== 'selection') {
      window.history.pushState({ view: currentView }, '', window.location.pathname);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentView]);

  const handleStartQuiz = (kanaList) => {
    setSelectedKana(kanaList);
    setCurrentView('quiz');
  };

  const handleQuizFinish = (results) => {
    if (results === null) {
      // User clicked "Back to selection" - go directly to selection
      setCurrentView('selection');
      setSelectedKana([]);
      setQuizResults(null);
    } else {
      // Quiz completed normally - show results
      setQuizResults(results);
      setCurrentView('results');
    }
  };

  const handleRestart = () => {
    setCurrentView('quiz');
  };

  const handleNewSelection = () => {
    setCurrentView('selection');
    setSelectedKana([]);
    setQuizResults(null);
  };

  const handleViewStatistics = () => {
    setCurrentView('statistics');
  };

  const handleBackToSelection = () => {
    setCurrentView('selection');
  };

  return (
    <div className="App">
      <LanguageSwitcher />
      
      {currentView === 'selection' && (
        <KanaSelection 
          onStartQuiz={handleStartQuiz} 
          onViewStatistics={handleViewStatistics}
        />
      )}
      
      {currentView === 'quiz' && (
        <KanaQuiz 
          kanaList={selectedKana}
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
