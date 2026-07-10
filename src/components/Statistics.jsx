import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getStatisticsByScript,
  getOverallStatistics,
  resetStatistics,
  exportStatistics,
  exportStatisticsAsBase64
} from '../utils/statisticsManager.js';
import ImportModal from './ImportModal.jsx';

const Statistics = ({ onBack }) => {
  const { t, i18n } = useTranslation();
  const [statisticsData, setStatisticsData] = useState({ hiragana: [], katakana: [] });
  const [overallStats, setOverallStats] = useState({});
  const [activeTab, setActiveTab] = useState('hiragana');
  const [sortBy, setSortBy] = useState('romaji');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = () => {
    setStatisticsData(getStatisticsByScript());
    setOverallStats(getOverallStatistics());
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleReset = () => {
    if (window.confirm(t('statistics.confirmReset'))) {
      resetStatistics();
      loadStatistics();
    }
  };

  const handleExport = () => {
    const exportData = exportStatistics();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kana-statistics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportAsCode = async () => {
    try {
      const base64Code = exportStatisticsAsBase64();
      await navigator.clipboard.writeText(base64Code);
      alert(t('statistics.exportCodeSuccess'));
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert(t('statistics.exportCodeError'));
    }
  };

  const getAccuracy = (stat) => {
    return stat.timesShown > 0 ? Math.round((stat.timesCorrect / stat.timesShown) * 100) : 0;
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return t('statistics.never');
    const date = new Date(lastSeen);
    const locale = i18n.language;
    return date.toLocaleDateString(locale) + ' ' + date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  };

  const formatResponseTime = (averageResponseTime) => {
    return averageResponseTime > 0 ? `${(averageResponseTime / 1000).toFixed(1)}s` : '-';
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  // A color-independent accuracy indicator (issue #68): the symbol conveys the
  // same threshold as the color, so it works without color perception.
  const accuracySymbol = (accuracy) => (accuracy >= 80 ? '✓' : accuracy >= 60 ? '•' : '✗');

  // Accessible sortable column header (issues #48): the click target is a real
  // <button> (keyboard-focusable, Enter/Space activate it) and the <th> carries
  // aria-sort so assistive tech announces the current sort state.
  const renderSortHeader = (column, labelKey) => (
    <th
      aria-sort={sortBy === column ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
    >
      <button
        type="button"
        onClick={() => handleSort(column)}
        className="flex items-center gap-1 uppercase tracking-wider hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
      >
        {t(labelKey)} <span aria-hidden="true">{getSortIcon(column)}</span>
      </button>
    </th>
  );

  const currentData = useMemo(() => {
    const data = statisticsData[activeTab] || [];
    return [...data].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle special cases
      if (sortBy === 'accuracy') {
        aValue = a.timesShown > 0 ? (a.timesCorrect / a.timesShown) * 100 : 0;
        bValue = b.timesShown > 0 ? (b.timesCorrect / b.timesShown) * 100 : 0;
      } else if (sortBy === 'lastSeen') {
        aValue = a.lastSeen ? new Date(a.lastSeen) : new Date(0);
        bValue = b.lastSeen ? new Date(b.lastSeen) : new Date(0);
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [statisticsData, activeTab, sortBy, sortOrder]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 transition-colors mb-4"
            >
              {t('navigation.backToSelection')}
            </button>
            <h1 className="text-4xl font-bold text-gray-800">
              {t('statistics.title')}
            </h1>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleExportAsCode}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {t('statistics.exportCode')}
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {t('statistics.importCode')}
            </button>
            <button
              onClick={handleExport}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {t('statistics.export')}
            </button>
            <button
              onClick={handleReset}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {t('statistics.reset')}
            </button>
          </div>
        </div>

        {/* Overall Statistics */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {t('statistics.overall')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{overallStats.practicedKana || 0}</div>
              <div className="text-sm text-gray-600">{t('statistics.practicedKana')}</div>
              <div className="text-xs text-gray-500">{t('statistics.outOf')} {overallStats.totalKana || 0}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{overallStats.totalCorrect || 0}</div>
              <div className="text-sm text-gray-600">{t('statistics.totalCorrect')}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-red-600">{overallStats.totalIncorrect || 0}</div>
              <div className="text-sm text-gray-600">{t('statistics.totalIncorrect')}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">{overallStats.overallAccuracy || 0}%</div>
              <div className="text-sm text-gray-600">{t('statistics.overallAccuracy')}</div>
            </div>
          </div>
        </div>

        {/* Script Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('hiragana')}
              className={`flex-1 py-4 px-6 text-lg font-semibold transition-colors ${
                activeTab === 'hiragana'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('scripts.hiragana')} ({statisticsData.hiragana?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('katakana')}
              className={`flex-1 py-4 px-6 text-lg font-semibold transition-colors ${
                activeTab === 'katakana'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('scripts.katakana')} ({statisticsData.katakana?.length || 0})
            </button>
          </div>

          {/* Statistics Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {renderSortHeader('kana', 'statistics.kana')}
                  {renderSortHeader('romaji', 'statistics.romaji')}
                  {renderSortHeader('timesShown', 'statistics.timesShown')}
                  {renderSortHeader('timesCorrect', 'statistics.timesCorrect')}
                  {renderSortHeader('timesIncorrect', 'statistics.timesIncorrect')}
                  {renderSortHeader('accuracy', 'statistics.accuracy')}
                  {renderSortHeader('averageResponseTime', 'statistics.avgResponseTime')}
                  {renderSortHeader('lastSeen', 'statistics.lastSeen')}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.map((stat, index) => (
                  <tr key={`${stat.kana}-${stat.romaji}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div lang="ja" className="text-2xl font-bold text-gray-900">{stat.kana}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">{stat.romaji}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{stat.timesShown}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-green-600 font-semibold">{stat.timesCorrect}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-red-600 font-semibold">{stat.timesIncorrect}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center gap-1 text-sm font-semibold ${
                        getAccuracy(stat) >= 80 ? 'text-green-600' :
                        getAccuracy(stat) >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {stat.timesShown > 0 ? (
                          <>
                            <span aria-hidden="true">{accuracySymbol(getAccuracy(stat))}</span>
                            <span>{getAccuracy(stat)}%</span>
                          </>
                        ) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatResponseTime(stat.averageResponseTime)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatLastSeen(stat.lastSeen)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {currentData.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">{t('statistics.noData')}</div>
              <div className="text-gray-400 text-sm mt-2">{t('statistics.startPracticing')}</div>
            </div>
          )}
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImported={loadStatistics}
        />
      )}
    </div>
  );
};

export default Statistics;