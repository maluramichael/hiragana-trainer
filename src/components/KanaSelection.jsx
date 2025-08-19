import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { kanaGroups } from '../data/kana.js';
import { getAllGroupProgress } from '../utils/progressCalculator.js';
import ProgressBar from './ProgressBar.jsx';

const KanaSelection = ({ onStartQuiz, onViewStatistics }) => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState({
    basic: false,
    basicSubs: {
      vowels: false,
      k: false,
      s: false,
      t: false,
      n: false,
      h: false,
      m: false,
      y: false,
      r: false,
      w: false
    },
    dakuten: false,
    dakutenSubs: {
      g: false,
      z: false,
      d: false,
      b: false
    },
    handakuten: false,
    handakutenSubs: {
      p: false
    }
  });

  useEffect(() => {
    // Load progress data when component mounts
    setProgress(getAllGroupProgress());
  }, []);

  const handleMainGroupToggle = (group) => {
    const newValue = !selectedGroups[group];
    setSelectedGroups(prev => ({
      ...prev,
      [group]: newValue,
      [`${group}Subs`]: Object.fromEntries(
        Object.keys(prev[`${group}Subs`]).map(key => [key, newValue])
      )
    }));
  };

  const handleSubGroupToggle = (mainGroup, subGroup) => {
    setSelectedGroups(prev => {
      const newSubs = {
        ...prev[`${mainGroup}Subs`],
        [subGroup]: !prev[`${mainGroup}Subs`][subGroup]
      };
      
      const allSubsSelected = Object.values(newSubs).every(Boolean);
      const anySubSelected = Object.values(newSubs).some(Boolean);
      
      return {
        ...prev,
        [`${mainGroup}Subs`]: newSubs,
        [mainGroup]: allSubsSelected || (anySubSelected && prev[mainGroup])
      };
    });
  };

  const getSelectedKana = () => {
    let selected = [];
    
    // Basic groups
    Object.entries(selectedGroups.basicSubs).forEach(([key, isSelected]) => {
      if (isSelected) {
        selected.push(...kanaGroups.basic[key].hiragana);
        selected.push(...kanaGroups.basic[key].katakana);
      }
    });
    
    // Dakuten groups
    Object.entries(selectedGroups.dakutenSubs).forEach(([key, isSelected]) => {
      if (isSelected) {
        selected.push(...kanaGroups.dakuten[key].hiragana);
        selected.push(...kanaGroups.dakuten[key].katakana);
      }
    });
    
    // Handakuten groups
    Object.entries(selectedGroups.handakutenSubs).forEach(([key, isSelected]) => {
      if (isSelected) {
        selected.push(...kanaGroups.handakuten[key].hiragana);
        selected.push(...kanaGroups.handakuten[key].katakana);
      }
    });
    
    return selected;
  };

  const handleStartQuiz = () => {
    const kanaToStudy = getSelectedKana();
    if (kanaToStudy.length > 0) {
      onStartQuiz(kanaToStudy);
    }
  };

  const selectedCount = getSelectedKana().length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
              {t('title')}
            </h1>
            <p className="text-center text-gray-600">
              {t('subtitle')}
            </p>
          </div>
          
          <button
            onClick={onViewStatistics}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
          >
            📊 {t('statistics.title')}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
            ひらがな & カタカナ (Hiragana & Katakana)
          </h2>
          
          <div className="space-y-4">
            {/* Basic Section */}
            <div>
              <div className="p-3 rounded-lg bg-gray-50 mb-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedGroups.basic}
                    onChange={() => handleMainGroupToggle('basic')}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="ml-3 text-gray-700 font-semibold flex-1">
                    {t('groups.basic')}
                  </span>
                </label>
                
                {progress && (
                  <div className="mt-2 ml-8">
                    <ProgressBar 
                      {...progress.basic.overall}
                      showDetails={true}
                      t={t}
                    />
                  </div>
                )}
              </div>
              
              <div className="ml-8 space-y-2 mt-2">
                {[
                  { key: 'vowels', translationKey: 'subgroups.vowels' },
                  { key: 'k', translationKey: 'subgroups.kSeries' },
                  { key: 's', translationKey: 'subgroups.sSeries' },
                  { key: 't', translationKey: 'subgroups.tSeries' },
                  { key: 'n', translationKey: 'subgroups.nSeries' },
                  { key: 'h', translationKey: 'subgroups.hSeries' },
                  { key: 'm', translationKey: 'subgroups.mSeries' },
                  { key: 'y', translationKey: 'subgroups.ySeries' },
                  { key: 'r', translationKey: 'subgroups.rSeries' },
                  { key: 'w', translationKey: 'subgroups.wSeries' }
                ].map(({ key, translationKey }) => (
                  <div key={key} className="p-2 rounded hover:bg-gray-50">
                    <label className="flex items-center cursor-pointer mb-1">
                      <input
                        type="checkbox"
                        checked={selectedGroups.basicSubs[key]}
                        onChange={() => handleSubGroupToggle('basic', key)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="ml-3 text-sm text-gray-600 flex-1">
                        {t(translationKey)}
                      </span>
                    </label>
                    
                    {progress && progress.basic.subgroups[key] && (
                      <div className="ml-7">
                        <ProgressBar 
                          {...progress.basic.subgroups[key]}
                          showDetails={false}
                          t={t}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Dakuten Section */}
            <div>
              <div className="p-3 rounded-lg bg-gray-50 mb-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedGroups.dakuten}
                    onChange={() => handleMainGroupToggle('dakuten')}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="ml-3 text-gray-700 font-semibold flex-1">
                    {t('groups.dakuten')}
                  </span>
                </label>
                
                {progress && (
                  <div className="mt-2 ml-8">
                    <ProgressBar 
                      {...progress.dakuten.overall}
                      showDetails={true}
                      t={t}
                    />
                  </div>
                )}
              </div>
              
              <div className="ml-8 space-y-2 mt-2">
                {[
                  { key: 'g', translationKey: 'subgroups.gSeries' },
                  { key: 'z', translationKey: 'subgroups.zSeries' },
                  { key: 'd', translationKey: 'subgroups.dSeries' },
                  { key: 'b', translationKey: 'subgroups.bSeries' }
                ].map(({ key, translationKey }) => (
                  <div key={key} className="p-2 rounded hover:bg-gray-50">
                    <label className="flex items-center cursor-pointer mb-1">
                      <input
                        type="checkbox"
                        checked={selectedGroups.dakutenSubs[key]}
                        onChange={() => handleSubGroupToggle('dakuten', key)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="ml-3 text-sm text-gray-600 flex-1">
                        {t(translationKey)}
                      </span>
                    </label>
                    
                    {progress && progress.dakuten.subgroups[key] && (
                      <div className="ml-7">
                        <ProgressBar 
                          {...progress.dakuten.subgroups[key]}
                          showDetails={false}
                          t={t}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Handakuten Section */}
            <div>
              <div className="p-3 rounded-lg bg-gray-50 mb-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedGroups.handakuten}
                    onChange={() => handleMainGroupToggle('handakuten')}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="ml-3 text-gray-700 font-semibold flex-1">
                    {t('groups.handakuten')}
                  </span>
                </label>
                
                {progress && (
                  <div className="mt-2 ml-8">
                    <ProgressBar 
                      {...progress.handakuten.overall}
                      showDetails={true}
                      t={t}
                    />
                  </div>
                )}
              </div>
              
              <div className="ml-8 space-y-2 mt-2">
                {[
                  { key: 'p', translationKey: 'subgroups.pSeries' }
                ].map(({ key, translationKey }) => (
                  <div key={key} className="p-2 rounded hover:bg-gray-50">
                    <label className="flex items-center cursor-pointer mb-1">
                      <input
                        type="checkbox"
                        checked={selectedGroups.handakutenSubs[key]}
                        onChange={() => handleSubGroupToggle('handakuten', key)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="ml-3 text-sm text-gray-600 flex-1">
                        {t(translationKey)}
                      </span>
                    </label>
                    
                    {progress && progress.handakuten.subgroups[key] && (
                      <div className="ml-7">
                        <ProgressBar 
                          {...progress.handakuten.subgroups[key]}
                          showDetails={false}
                          t={t}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Start Quiz Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <button
                onClick={handleStartQuiz}
                disabled={selectedCount === 0}
                className={`px-8 py-4 rounded-xl text-xl font-semibold transition-all transform ${
                  selectedCount > 0
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:scale-105 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {selectedCount > 0 ? (
                  <>
                    🚀 {t('selection.startQuiz')}
                  </>
                ) : (
                  t('selection.startQuiz')
                )}
              </button>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanaSelection;