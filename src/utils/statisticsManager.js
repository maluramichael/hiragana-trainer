const STORAGE_KEY = 'kana-quiz-statistics';
const STREAK_KEY = 'kana-quiz-best-streak';
const DAILY_STREAK_KEY = 'kana-quiz-daily-streak';
const SCHEMA_VERSION = 2;

// Leitner spaced-repetition boxes 0..5 with their review intervals in days.
// A correct answer moves the kana one box up (longer interval), a wrong answer
// drops it back to box 0 (due again immediately).
const SR_INTERVALS_DAYS = [0, 1, 3, 7, 14, 30];
const SR_MAX_BOX = SR_INTERVALS_DAYS.length - 1;
const DAY_MS = 86400000;

// Single source of truth for script detection (Hiragana Unicode range, else Katakana)
const scriptOf = (kana) => (/[぀-ゟ]/.test(kana) ? 'hiragana' : 'katakana');

const isNonEmptyString = (value) => typeof value === 'string' && value.length > 0;

// Normalize any numeric field to a finite, non-negative number (default 0)
const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

// Normalize a Date (or date-like value) to a local calendar day 'YYYY-MM-DD'.
// Uses local getters on purpose so a practice day is the user's wall-clock day.
const toLocalDateString = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Whole-day difference between two 'YYYY-MM-DD' strings (toStr - fromStr).
// Anchored at UTC midnight so DST shifts cannot produce a fractional day.
const daysBetween = (fromStr, toStr) => {
  const [fy, fm, fd] = fromStr.split('-').map(Number);
  const [ty, tm, td] = toStr.split('-').map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / DAY_MS);
};

// Read the raw localStorage blob and return the flat stats map, migrating legacy blobs.
// Legacy blobs are the raw stats map itself (no schemaVersion wrapper).
const migrate = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return {};
  }
  if ('schemaVersion' in raw) {
    return raw.stats && typeof raw.stats === 'object' ? raw.stats : {};
  }
  // Legacy format: the object is the flat stats map itself
  return raw;
};

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
        script: scriptOf(kana.kana),
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

// Get statistics from localStorage (returns the flat stats map, migrating legacy blobs)
export const getStatistics = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? migrate(JSON.parse(stored)) : {};
  } catch (error) {
    console.error('Error reading statistics from localStorage:', error);
    return {};
  }
};

// Save statistics to localStorage. Returns true on success, false on failure
// (e.g. QuotaExceededError) so callers can surface the error.
export const saveStatistics = (statistics) => {
  try {
    const blob = { schemaVersion: SCHEMA_VERSION, stats: statistics };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blob));
    return true;
  } catch (error) {
    console.error('Error saving statistics to localStorage:', error);
    return false;
  }
};

// Apply several {kana, romaji, isCorrect, responseTime} updates in a single
// get -> mutate -> save cycle. Returns the updated stat objects.
export const updateKanaStatistics = (entries) => {
  const list = Array.isArray(entries) ? entries : [entries];
  const statistics = getStatistics();
  const updated = [];

  list.forEach(({ kana, romaji, isCorrect, responseTime = null }) => {
    const key = `${kana}-${romaji}`;

    if (!statistics[key]) {
      // Initialize if doesn't exist
      statistics[key] = {
        kana,
        romaji,
        script: scriptOf(kana),
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
    if (responseTime !== null && responseTime !== undefined) {
      stat.responseTimes.push(responseTime);
      // Keep only last 10 response times to avoid storage bloat
      if (stat.responseTimes.length > 10) {
        stat.responseTimes = stat.responseTimes.slice(-10);
      }
      // Calculate average response time
      stat.averageResponseTime = stat.responseTimes.reduce((sum, time) => sum + time, 0) / stat.responseTimes.length;
    }

    updated.push(stat);
  });

  saveStatistics(statistics);
  return updated;
};

// Update statistics for a specific kana (single-entry convenience wrapper)
export const updateKanaStatistic = (kana, romaji, isCorrect, responseTime = null) => {
  const [stat] = updateKanaStatistics([{ kana, romaji, isCorrect, responseTime }]);
  return stat;
};

// Get statistics for all kana, grouped by script
export const getStatisticsByScript = () => {
  const statistics = getStatistics();
  const result = {
    hiragana: [],
    katakana: []
  };

  Object.values(statistics).forEach(stat => {
    // Classify only by an explicit, known script value; entries with a
    // missing/unknown script are not silently dumped into katakana.
    if (stat.script === 'hiragana') {
      result.hiragana.push(stat);
    } else if (stat.script === 'katakana') {
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

// Validate & normalize a single imported entry (compact or full shape).
// Returns a complete stat object, or null if the entry is unusable.
const normalizeImportedStat = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const kana = raw.kana ?? raw.k;
  const romaji = raw.romaji ?? raw.r;
  if (!isNonEmptyString(kana) || !isNonEmptyString(romaji)) {
    return null;
  }
  const rawScript = raw.script;
  const script = rawScript === 'hiragana' || rawScript === 'katakana' ? rawScript : scriptOf(kana);
  const lastSeen = raw.lastSeen ?? raw.l;
  const responseTimes = Array.isArray(raw.responseTimes)
    ? raw.responseTimes.map(Number).filter(Number.isFinite)
    : [];

  return {
    kana,
    romaji,
    script,
    timesShown: toNumber(raw.timesShown ?? raw.s),
    timesCorrect: toNumber(raw.timesCorrect ?? raw.c),
    timesIncorrect: toNumber(raw.timesIncorrect ?? raw.i),
    lastSeen: isNonEmptyString(lastSeen) ? lastSeen : null,
    averageResponseTime: toNumber(raw.averageResponseTime ?? raw.a),
    responseTimes
  };
};

// Merge an incoming stat into an existing one. Counters are additive; lastSeen
// is the newer date; averageResponseTime is weighted by sample size (timesShown).
const mergeStat = (existing, incoming) => {
  if (!existing) {
    return incoming;
  }
  const timesShown = existing.timesShown + incoming.timesShown;
  const averageResponseTime = timesShown > 0
    ? (existing.averageResponseTime * existing.timesShown + incoming.averageResponseTime * incoming.timesShown) / timesShown
    : 0;
  const lastSeen = [existing.lastSeen, incoming.lastSeen].filter(Boolean).sort().pop() || null;

  return {
    kana: existing.kana,
    romaji: existing.romaji,
    script: existing.script === 'hiragana' || existing.script === 'katakana' ? existing.script : incoming.script,
    timesShown,
    timesCorrect: existing.timesCorrect + incoming.timesCorrect,
    timesIncorrect: existing.timesIncorrect + incoming.timesIncorrect,
    lastSeen,
    averageResponseTime,
    // ISO strings sort chronologically; keep the last 10 combined samples
    responseTimes: [...(existing.responseTimes || []), ...(incoming.responseTimes || [])].slice(-10)
  };
};

// Import statistics from base64 string.
// options.mode: 'merge' (default, additive) or 'replace' (overwrite local state).
export const importStatisticsFromBase64 = (base64String, options = {}) => {
  const mode = options.mode === 'replace' ? 'replace' : 'merge';
  try {
    // Decode base64 string
    const jsonString = decodeURIComponent(escape(atob(base64String)));
    const importData = JSON.parse(jsonString);

    // Collect the raw entries depending on the format version
    let rawEntries;
    if (importData.v === '2.0' || importData.s) {
      // New compact format (v2.0)
      if (!Array.isArray(importData.s)) {
        throw new Error('Invalid compact statistics data format');
      }
      rawEntries = importData.s;
    } else if (importData.statistics || importData.version === '1.0') {
      // Old format (v1.0) - direct statistics object
      if (!importData.statistics || typeof importData.statistics !== 'object') {
        throw new Error('Invalid statistics data format');
      }
      rawEntries = Object.values(importData.statistics);
    } else {
      throw new Error('Unknown statistics format version');
    }

    // Validate & normalize; invalid entries are discarded, not imported.
    const imported = {};
    rawEntries.forEach(raw => {
      const stat = normalizeImportedStat(raw);
      if (stat) {
        imported[`${stat.kana}-${stat.romaji}`] = stat;
      }
    });

    if (Object.keys(imported).length === 0) {
      throw new Error('No valid statistics entries found');
    }

    // Merge into (or replace) the existing local state
    const existing = mode === 'replace' ? {} : getStatistics();
    const result = { ...existing };
    Object.entries(imported).forEach(([key, stat]) => {
      result[key] = mergeStat(mode === 'replace' ? null : existing[key], stat);
    });

    if (!saveStatistics(result)) {
      return {
        success: false,
        message: 'Failed to save imported statistics. Storage may be full.'
      };
    }

    return {
      success: true,
      message: 'Statistics imported successfully',
      importDate: importData.d || importData.exportDate || new Date().toISOString(),
      imported: Object.keys(imported).length,
      mode
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

// Get the persisted best streak (default 0)
export const getBestStreak = () => {
  try {
    const n = Number(localStorage.getItem(STREAK_KEY));
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  } catch (error) {
    console.error('Error reading best streak from localStorage:', error);
    return 0;
  }
};

// Persist a new streak only if it beats the stored best.
// Returns { bestStreak, isRecord }.
export const updateBestStreak = (streak) => {
  const current = getBestStreak();
  const value = Number(streak);
  const candidate = Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;

  if (candidate > current) {
    try {
      localStorage.setItem(STREAK_KEY, String(candidate));
    } catch (error) {
      console.error('Error saving best streak to localStorage:', error);
      return { bestStreak: current, isRecord: false };
    }
    return { bestStreak: candidate, isRecord: true };
  }

  return { bestStreak: current, isRecord: false };
};

// --- Daily practice streak (#7) -------------------------------------------

// Read the persisted daily streak. Returns { current, longest, lastPracticeDate }.
export const getDailyStreak = () => {
  try {
    const stored = localStorage.getItem(DAILY_STREAK_KEY);
    if (!stored) {
      return { current: 0, longest: 0, lastPracticeDate: null };
    }
    const parsed = JSON.parse(stored);
    return {
      current: toNumber(parsed.current),
      longest: toNumber(parsed.longest),
      lastPracticeDate: isNonEmptyString(parsed.lastPracticeDate) ? parsed.lastPracticeDate : null
    };
  } catch (error) {
    console.error('Error reading daily streak from localStorage:', error);
    return { current: 0, longest: 0, lastPracticeDate: null };
  }
};

// Record that the user practiced on `date` (default today). Increments the
// streak when the previous practice day was yesterday, keeps it when they
// already practiced today, and resets to 1 on any gap. `date` is a parameter
// so tests can drive consecutive/broken days deterministically.
// Returns the updated { current, longest, lastPracticeDate }.
export const recordPracticeDay = (date = new Date()) => {
  const today = toLocalDateString(date);
  const { current, longest, lastPracticeDate } = getDailyStreak();

  let nextCurrent;
  if (!lastPracticeDate) {
    nextCurrent = 1;
  } else {
    const diff = daysBetween(lastPracticeDate, today);
    if (diff === 0) {
      nextCurrent = current > 0 ? current : 1; // already practiced today
    } else if (diff === 1) {
      nextCurrent = current + 1; // consecutive day
    } else {
      nextCurrent = 1; // gap (or clock moved backwards)
    }
  }

  const result = {
    current: nextCurrent,
    longest: Math.max(longest, nextCurrent),
    lastPracticeDate: today
  };

  try {
    localStorage.setItem(DAILY_STREAK_KEY, JSON.stringify(result));
  } catch (error) {
    console.error('Error saving daily streak to localStorage:', error);
  }
  return result;
};

// --- Weak kana selection (#9) ---------------------------------------------

// Return the stat objects for kana the learner struggles with, weakest first.
// A kana is "weak" once it has at least `minAttempts` graded attempts AND its
// accuracy is below `accuracyThreshold` (or it has been missed at least as
// often as it was answered correctly). Both thresholds are configurable.
export const getWeakKana = (options = {}) => {
  const { minAttempts = 3, accuracyThreshold = 0.6 } = options;
  const statistics = getStatistics();

  return Object.values(statistics)
    .map(stat => {
      const attempts = stat.timesCorrect + stat.timesIncorrect;
      const accuracy = attempts > 0 ? stat.timesCorrect / attempts : 1;
      return { stat, attempts, accuracy };
    })
    .filter(({ stat, attempts, accuracy }) =>
      attempts >= minAttempts &&
      (accuracy < accuracyThreshold || stat.timesIncorrect >= stat.timesCorrect))
    .sort((a, b) => a.accuracy - b.accuracy)
    .map(({ stat }) => stat);
};

// --- Lightweight spaced repetition (#12) ----------------------------------

// Update a kana's Leitner box + next due date after an answer. Correct moves
// one box up (capped at SR_MAX_BOX), wrong drops to box 0. Fields are stored
// additively on the stat object; missing box/dueAt are treated as box 0.
// `now` is a parameter for deterministic tests.
// Returns { key, box, dueAt }.
export const scheduleReview = (key, wasCorrect, now = new Date()) => {
  const statistics = getStatistics();
  let stat = statistics[key];

  if (!stat) {
    // Reconstruct kana/romaji from the "<kana>-<romaji>" key (kana never
    // contains '-', so the first dash is the separator).
    const dash = key.indexOf('-');
    const kana = dash >= 0 ? key.slice(0, dash) : key;
    const romaji = dash >= 0 ? key.slice(dash + 1) : '';
    stat = statistics[key] = {
      kana,
      romaji,
      script: scriptOf(kana),
      timesShown: 0,
      timesCorrect: 0,
      timesIncorrect: 0,
      lastSeen: null,
      averageResponseTime: 0,
      responseTimes: []
    };
  }

  const currentBox = Number.isInteger(stat.box) ? stat.box : 0;
  const nextBox = wasCorrect ? Math.min(currentBox + 1, SR_MAX_BOX) : 0;
  const nowMs = now instanceof Date ? now.getTime() : new Date(now).getTime();
  const dueAt = new Date(nowMs + SR_INTERVALS_DAYS[nextBox] * DAY_MS).toISOString();

  stat.box = nextBox;
  stat.dueAt = dueAt;
  saveStatistics(statistics);
  return { key, box: nextBox, dueAt };
};

// Return the keys of kana due for review at `now`. Without `candidateKeys` all
// known kana are considered. A kana with no dueAt (never scheduled) counts as
// due immediately, so new kana surface right away.
export const getDueKana = (candidateKeys = null, now = new Date()) => {
  const statistics = getStatistics();
  const keys = Array.isArray(candidateKeys) ? candidateKeys : Object.keys(statistics);
  const nowMs = now instanceof Date ? now.getTime() : new Date(now).getTime();

  return keys.filter(key => {
    const stat = statistics[key];
    if (!stat || !stat.dueAt) {
      return true; // missing SR fields = due now
    }
    const dueMs = Date.parse(stat.dueAt);
    return !Number.isFinite(dueMs) || dueMs <= nowMs;
  });
};
