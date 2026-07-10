const STORAGE_KEY = 'kana-quiz-statistics';

// Initialize statistics for all kana
export const initializeStatistics = async () => {
  const existingStats = getStatistics();
  if (Object.keys(existingStats).length > 0) {
    return existingStats;
  }

  // Create initial structure for all kana
  const initialStats = {};
  
  try {
    // Import all kana from data
    const { hiragana, katakana } = await import('../data/kana.js');
    
    [...hiragana, ...katakana].forEach(kana => {
      const key = `${kana.kana}-${kana.romaji}`;
      initialStats[key] = {
        kana: kana.kana,
        romaji: kana.romaji,
        script: hiragana.includes(kana) ? 'hiragana' : 'katakana',
        timesShown: 0,
        timesCorrect: 0,
        timesIncorrect: 0,
        lastSeen: null,
        averageResponseTime: 0,
        responseTimes: []
      };
    });
    
    saveStatistics(initialStats);
    return initialStats;
  } catch (error) {
    console.error('Error initializing statistics:', error);
    return {};
  }
};

// Get statistics from localStorage
export const getStatistics = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading statistics from localStorage:', error);
    return {};
  }
};

// Save statistics to localStorage
export const saveStatistics = (statistics) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statistics));
  } catch (error) {
    console.error('Error saving statistics to localStorage:', error);
  }
};

// Update statistics for a specific kana
export const updateKanaStatistic = (kana, romaji, isCorrect, responseTime = null) => {
  const statistics = getStatistics();
  const key = `${kana}-${romaji}`;
  
  if (!statistics[key]) {
    // Initialize if doesn't exist
    statistics[key] = {
      kana,
      romaji,
      script: /[\u3040-\u309F]/.test(kana) ? 'hiragana' : 'katakana', // Unicode range check
      timesShown: 0,
      timesCorrect: 0,
      timesIncorrect: 0,
      lastSeen: null,
      averageResponseTime: 0,
      responseTimes: []
    };
  }

  const stat = statistics[key];
  stat.timesShown += 1;
  stat.lastSeen = new Date().toISOString();

  if (isCorrect) {
    stat.timesCorrect += 1;
  } else {
    stat.timesIncorrect += 1;
  }

  // Track response time if provided
  if (responseTime !== null) {
    stat.responseTimes.push(responseTime);
    // Keep only last 10 response times to avoid storage bloat
    if (stat.responseTimes.length > 10) {
      stat.responseTimes = stat.responseTimes.slice(-10);
    }
    // Calculate average response time
    stat.averageResponseTime = stat.responseTimes.reduce((sum, time) => sum + time, 0) / stat.responseTimes.length;
  }

  saveStatistics(statistics);
  return statistics[key];
};

// Get statistics for all kana, grouped by script
export const getStatisticsByScript = () => {
  const statistics = getStatistics();
  const result = {
    hiragana: [],
    katakana: []
  };

  Object.values(statistics).forEach(stat => {
    if (stat.script === 'hiragana') {
      result.hiragana.push(stat);
    } else {
      result.katakana.push(stat);
    }
  });

  // Sort by romaji for consistent ordering
  result.hiragana.sort((a, b) => a.romaji.localeCompare(b.romaji));
  result.katakana.sort((a, b) => a.romaji.localeCompare(b.romaji));

  return result;
};

// Get overall statistics summary
export const getOverallStatistics = () => {
  const statistics = getStatistics();
  const stats = Object.values(statistics);
  
  const totalShown = stats.reduce((sum, stat) => sum + stat.timesShown, 0);
  const totalCorrect = stats.reduce((sum, stat) => sum + stat.timesCorrect, 0);
  const totalIncorrect = stats.reduce((sum, stat) => sum + stat.timesIncorrect, 0);
  
  return {
    totalKana: stats.length,
    totalShown,
    totalCorrect,
    totalIncorrect,
    overallAccuracy: totalShown > 0 ? Math.round((totalCorrect / totalShown) * 100) : 0,
    practicedKana: stats.filter(stat => stat.timesShown > 0).length
  };
};

// Reset all statistics
export const resetStatistics = () => {
  localStorage.removeItem(STORAGE_KEY);
  return initializeStatistics();
};

// Export statistics as JSON for backup
export const exportStatistics = () => {
  const statistics = getStatistics();
  const exportData = {
    exportDate: new Date().toISOString(),
    statistics
  };
  return JSON.stringify(exportData, null, 2);
};

// Export statistics as base64 string for cross-device transfer (compact format)
export const exportStatisticsAsBase64 = () => {
  const statistics = getStatistics();

  // Create compact format - only export practiced kana with shortened property names
  const compactStats = Object.values(statistics)
    .filter(stat => stat.timesShown > 0) // Only export kana that have been practiced
    .map(stat => ({
      k: stat.kana,
      r: stat.romaji,
      s: stat.timesShown,
      c: stat.timesCorrect,
      i: stat.timesIncorrect,
      ...(stat.lastSeen && { l: stat.lastSeen }), // Only include if not null
      ...(stat.averageResponseTime > 0 && { a: Math.round(stat.averageResponseTime) }) // Round to integer
    }));

  const exportData = {
    v: '2.0', // version
    d: new Date().toISOString(), // exportDate
    s: compactStats // stats
  };

  const jsonString = JSON.stringify(exportData);
  // Convert to base64 using browser's btoa function
  return btoa(unescape(encodeURIComponent(jsonString)));
};

// Import statistics from base64 string
export const importStatisticsFromBase64 = (base64String) => {
  try {
    // Decode base64 string
    const jsonString = decodeURIComponent(escape(atob(base64String)));
    const importData = JSON.parse(jsonString);

    let statistics = {};

    // Handle different format versions
    if (importData.v === '2.0' || importData.s) {
      // New compact format (v2.0)
      if (!importData.s || !Array.isArray(importData.s)) {
        throw new Error('Invalid compact statistics data format');
      }

      // Convert compact format back to full format
      importData.s.forEach(stat => {
        const key = `${stat.k}-${stat.r}`;
        statistics[key] = {
          kana: stat.k,
          romaji: stat.r,
          script: /[\u3040-\u309F]/.test(stat.k) ? 'hiragana' : 'katakana', // Detect from Unicode range
          timesShown: stat.s || 0,
          timesCorrect: stat.c || 0,
          timesIncorrect: stat.i || 0,
          lastSeen: stat.l || null,
          averageResponseTime: stat.a || 0,
          responseTimes: [] // Initialize empty array
        };
      });
    } else if (importData.statistics || importData.version === '1.0') {
      // Old format (v1.0) - direct statistics object
      if (!importData.statistics || typeof importData.statistics !== 'object') {
        throw new Error('Invalid statistics data format');
      }
      statistics = importData.statistics;
    } else {
      throw new Error('Unknown statistics format version');
    }

    // Merge with existing statistics or replace
    saveStatistics(statistics);
    return {
      success: true,
      message: 'Statistics imported successfully',
      importDate: importData.d || importData.exportDate || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error importing statistics:', error);
    return {
      success: false,
      message: 'Failed to import statistics. Please check the provided code.',
      error: error.message
    };
  }
};