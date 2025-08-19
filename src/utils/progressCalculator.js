import { getStatistics } from './statisticsManager.js';
import { kanaGroups } from '../data/kana.js';

// Calculate progress for a specific kana group
export const calculateGroupProgress = (groupType, subGroupKey = null) => {
  const statistics = getStatistics();
  let relevantKana = [];

  // Get the relevant kana for this group
  if (subGroupKey) {
    // Sub-group (e.g., vowels, k-series)
    const subGroup = kanaGroups[groupType][subGroupKey];
    if (subGroup && subGroup.hiragana && subGroup.katakana) {
      relevantKana = [...subGroup.hiragana, ...subGroup.katakana];
    }
  } else {
    // Main group (e.g., all basic, all dakuten)
    const mainGroup = kanaGroups[groupType];
    if (mainGroup) {
      Object.values(mainGroup).forEach(subGroup => {
        if (subGroup.hiragana && subGroup.katakana) {
          relevantKana.push(...subGroup.hiragana, ...subGroup.katakana);
        }
      });
    }
  }

  if (relevantKana.length === 0) {
    return { level: 0, accuracy: 0, totalShown: 0, color: '#e5e7eb' };
  }

  // Calculate statistics for this group
  let totalShown = 0;
  let totalCorrect = 0;
  let totalAttempts = 0;

  relevantKana.forEach(kana => {
    const key = `${kana.kana}-${kana.romaji}`;
    const stat = statistics[key];
    
    if (stat) {
      totalShown += stat.timesShown;
      totalCorrect += stat.timesCorrect;
      totalAttempts += stat.timesShown;
    }
  });

  // Calculate accuracy
  const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
  
  // Calculate practice coverage (how many kana in this group have been practiced)
  const practicedCount = relevantKana.filter(kana => {
    const key = `${kana.kana}-${kana.romaji}`;
    const stat = statistics[key];
    return stat && stat.timesShown > 0;
  }).length;
  
  const coverage = (practicedCount / relevantKana.length) * 100;
  
  // Calculate level (0-10) based on accuracy and coverage
  // Level considers both accuracy and coverage
  let level = 0;
  
  if (coverage >= 10) { // At least 10% practiced
    if (accuracy >= 95 && coverage >= 90) level = 10;
    else if (accuracy >= 90 && coverage >= 80) level = 9;
    else if (accuracy >= 85 && coverage >= 70) level = 8;
    else if (accuracy >= 80 && coverage >= 60) level = 7;
    else if (accuracy >= 75 && coverage >= 50) level = 6;
    else if (accuracy >= 70 && coverage >= 40) level = 5;
    else if (accuracy >= 65 && coverage >= 30) level = 4;
    else if (accuracy >= 60 && coverage >= 20) level = 3;
    else if (accuracy >= 50 && coverage >= 15) level = 2;
    else if (coverage >= 10) level = 1;
  }

  // Generate color based on level
  const color = getLevelColor(level);

  return {
    level,
    accuracy: Math.round(accuracy),
    coverage: Math.round(coverage),
    totalShown,
    totalCorrect,
    totalKana: relevantKana.length,
    practicedKana: practicedCount,
    color
  };
};

// Get color based on progress level (0-10)
export const getLevelColor = (level) => {
  const colors = [
    '#e5e7eb', // 0 - Gray (not started)
    '#fef3c7', // 1 - Very light yellow
    '#fde68a', // 2 - Light yellow
    '#fcd34d', // 3 - Yellow
    '#f59e0b', // 4 - Amber
    '#f97316', // 5 - Orange
    '#ea580c', // 6 - Dark orange
    '#dc2626', // 7 - Red
    '#b91c1c', // 8 - Dark red
    '#16a34a', // 9 - Green
    '#15803d'  // 10 - Dark green
  ];
  
  return colors[Math.min(level, 10)];
};

// Get progress for all groups (for displaying on selection screen)
export const getAllGroupProgress = () => {
  const progress = {
    basic: {
      overall: calculateGroupProgress('basic'),
      subgroups: {
        vowels: calculateGroupProgress('basic', 'vowels'),
        k: calculateGroupProgress('basic', 'k'),
        s: calculateGroupProgress('basic', 's'),
        t: calculateGroupProgress('basic', 't'),
        n: calculateGroupProgress('basic', 'n'),
        h: calculateGroupProgress('basic', 'h'),
        m: calculateGroupProgress('basic', 'm'),
        y: calculateGroupProgress('basic', 'y'),
        r: calculateGroupProgress('basic', 'r'),
        w: calculateGroupProgress('basic', 'w')
      }
    },
    dakuten: {
      overall: calculateGroupProgress('dakuten'),
      subgroups: {
        g: calculateGroupProgress('dakuten', 'g'),
        z: calculateGroupProgress('dakuten', 'z'),
        d: calculateGroupProgress('dakuten', 'd'),
        b: calculateGroupProgress('dakuten', 'b')
      }
    },
    handakuten: {
      overall: calculateGroupProgress('handakuten'),
      subgroups: {
        p: calculateGroupProgress('handakuten', 'p')
      }
    }
  };

  return progress;
};

// Generate progress bar segments for visual display
export const getProgressBarSegments = (level) => {
  const segments = [];
  
  for (let i = 1; i <= 10; i++) {
    segments.push({
      active: i <= level,
      color: i <= level ? getLevelColor(level) : '#e5e7eb'
    });
  }
  
  return segments;
};

// Get a text description of the progress level
export const getProgressDescription = (level, t) => {
  const descriptions = {
    0: t?.('progress.notStarted') || 'Not started',
    1: t?.('progress.beginner') || 'Beginner',
    2: t?.('progress.beginner') || 'Beginner',
    3: t?.('progress.beginner') || 'Beginner',
    4: t?.('progress.intermediate') || 'Intermediate',
    5: t?.('progress.intermediate') || 'Intermediate',
    6: t?.('progress.intermediate') || 'Intermediate',
    7: t?.('progress.advanced') || 'Advanced',
    8: t?.('progress.advanced') || 'Advanced',
    9: t?.('progress.expert') || 'Expert',
    10: t?.('progress.master') || 'Master'
  };
  
  return descriptions[level] || descriptions[0];
};