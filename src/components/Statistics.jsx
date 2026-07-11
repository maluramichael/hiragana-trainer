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
import { Card, StatTile, Button, Icon, AppFooter } from '../ui/index.js';

const Statistics = ({ onBack }) => {
  const { t, i18n } = useTranslation();
  const [statisticsData, setStatisticsData] = useState({ hiragana: [], katakana: [] });
  const [overallStats, setOverallStats] = useState({});
  const [activeTab, setActiveTab] = useState('hiragana');
  const [sortBy, setSortBy] = useState('romaji');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => { loadStatistics(); }, []);

  const loadStatistics = () => {
    setStatisticsData(getStatisticsByScript());
    setOverallStats(getOverallStatistics());
  };

  const handleSort = (column) => {
    if (sortBy === column) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(column); setSortOrder('asc'); }
  };

  const handleReset = () => {
    if (window.confirm(t('statistics.confirmReset'))) { resetStatistics(); loadStatistics(); }
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
      await navigator.clipboard.writeText(exportStatisticsAsBase64());
      alert(t('statistics.exportCodeSuccess'));
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert(t('statistics.exportCodeError'));
    }
  };

  const getAccuracy = (stat) => stat.timesShown > 0 ? Math.round((stat.timesCorrect / stat.timesShown) * 100) : 0;

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return t('statistics.never');
    const date = new Date(lastSeen);
    const locale = i18n.language;
    return date.toLocaleDateString(locale) + ' ' + date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  };

  const formatResponseTime = (avg) => avg > 0 ? `${(avg / 1000).toFixed(1)}s` : '-';

  const getSortIcon = (column) => (sortBy !== column ? '↕' : sortOrder === 'asc' ? '↑' : '↓');
  const accuracySymbol = (a) => (a >= 80 ? '✓' : a >= 60 ? '•' : '✗');
  const accTone = (a) => (a >= 80 ? 'var(--emerald-600)' : a >= 60 ? 'var(--amber-500)' : 'var(--rose-600)');

  const th = { padding: '0.7rem var(--space-4)', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'var(--tracking-caps)', color: 'var(--text-faint)', textAlign: 'left', whiteSpace: 'nowrap' };
  const td = { padding: '0.6rem var(--space-4)', whiteSpace: 'nowrap' };

  const renderSortHeader = (column, labelKey) => (
    <th aria-sort={sortBy === column ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'} style={th}>
      <button type="button" onClick={() => handleSort(column)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: 'inherit', textTransform: 'uppercase', letterSpacing: 'var(--tracking-caps)' }}>
        {t(labelKey)} <span aria-hidden="true">{getSortIcon(column)}</span>
      </button>
    </th>
  );

  const currentData = useMemo(() => {
    const data = statisticsData[activeTab] || [];
    return [...data].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      if (sortBy === 'accuracy') {
        aValue = a.timesShown > 0 ? (a.timesCorrect / a.timesShown) * 100 : 0;
        bValue = b.timesShown > 0 ? (b.timesCorrect / b.timesShown) * 100 : 0;
      } else if (sortBy === 'lastSeen') {
        aValue = a.lastSeen ? new Date(a.lastSeen) : new Date(0);
        bValue = b.lastSeen ? new Date(b.lastSeen) : new Date(0);
      }
      if (typeof aValue === 'string') return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [statisticsData, activeTab, sortBy, sortOrder]);

  return (
    <main style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{ maxWidth: 'var(--width-wide)', margin: '0 auto', padding: 'var(--space-8) var(--space-6) var(--space-16)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          <div>
            <Button variant="ghost" size="sm" iconLeft="arrow-left" onClick={onBack} style={{ marginBottom: 8, marginLeft: -8 }}>{t('navigation.backToSelection')}</Button>
            <h1 style={{ fontSize: 'clamp(2rem, 6vw, var(--text-4xl))' }}>{t('statistics.title')}</h1>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button variant="secondary" size="sm" iconLeft="upload" onClick={handleExportAsCode}>{t('statistics.exportCode')}</Button>
            <Button variant="secondary" size="sm" iconLeft="download" onClick={() => setShowImportModal(true)}>{t('statistics.importCode')}</Button>
            <Button variant="secondary" size="sm" iconLeft="download" onClick={handleExport}>{t('statistics.export')}</Button>
            <Button variant="danger" size="sm" iconLeft="rotate-ccw" onClick={handleReset}>{t('statistics.reset')}</Button>
          </div>
        </div>

        {/* Overall */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <StatTile value={overallStats.practicedKana || 0} label={t('statistics.practicedKana')} sub={`${t('statistics.outOf')} ${overallStats.totalKana || 0}`} tone="violet" icon="book-open" />
          <StatTile value={overallStats.totalCorrect || 0} label={t('statistics.totalCorrect')} tone="emerald" icon="check-circle" />
          <StatTile value={overallStats.totalIncorrect || 0} label={t('statistics.totalIncorrect')} tone="rose" icon="x-circle" />
          <StatTile value={`${overallStats.overallAccuracy || 0}%`} label={t('statistics.overallAccuracy')} tone="fuchsia" icon="target" />
        </div>

        <Card padding="sm" style={{ overflow: 'hidden' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, padding: 'var(--space-2)' }}>
            {[['hiragana', t('scripts.hiragana')], ['katakana', t('scripts.katakana')]].map(([k, lbl]) => (
              <button key={k} onClick={() => setActiveTab(k)} style={{
                flex: 1, padding: '0.7rem', borderRadius: 'var(--radius-xl)', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-base)',
                background: activeTab === k ? 'var(--color-primary)' : 'transparent',
                color: activeTab === k ? '#fff' : 'var(--text-muted)',
                transition: 'all var(--dur-fast) var(--ease-soft)',
              }}>{lbl} ({statisticsData[k]?.length || 0})</button>
            ))}
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)' }}>
              <thead>
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
              <tbody>
                {currentData.map((stat, index) => {
                  const a = getAccuracy(stat);
                  return (
                    <tr key={`${stat.kana}-${stat.romaji}`} style={{ background: index % 2 ? 'var(--surface-sunken)' : 'transparent' }}>
                      <td style={{ ...td, fontFamily: 'var(--font-kana)', fontWeight: 500, fontSize: 'var(--text-2xl)', color: 'var(--text-strong)' }}><span lang="ja">{stat.kana}</span></td>
                      <td style={{ ...td, fontFamily: 'var(--font-mono)', color: 'var(--text-body)' }}>{stat.romaji}</td>
                      <td style={{ ...td, color: 'var(--text-body)' }}>{stat.timesShown}</td>
                      <td style={{ ...td, color: 'var(--emerald-600)', fontWeight: 700 }}>{stat.timesCorrect}</td>
                      <td style={{ ...td, color: 'var(--rose-600)', fontWeight: 700 }}>{stat.timesIncorrect}</td>
                      <td style={{ ...td, fontWeight: 700, color: accTone(a) }}>
                        {stat.timesShown > 0 ? (<><span aria-hidden="true">{accuracySymbol(a)}</span> {a}%</>) : '-'}
                      </td>
                      <td style={{ ...td, color: 'var(--text-body)' }}>{formatResponseTime(stat.averageResponseTime)}</td>
                      <td style={{ ...td, color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>{formatLastSeen(stat.lastSeen)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {currentData.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-12) 0' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-lg)' }}>{t('statistics.noData')}</div>
              <div style={{ color: 'var(--text-faint)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>{t('statistics.startPracticing')}</div>
            </div>
          )}
        </Card>

        <AppFooter />
      </div>

      {showImportModal && (
        <ImportModal onClose={() => setShowImportModal(false)} onImported={loadStatistics} />
      )}
    </main>
  );
};

export default Statistics;
