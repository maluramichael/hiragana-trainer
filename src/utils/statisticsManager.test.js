import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getStatistics,
  saveStatistics,
  updateKanaStatistic,
  updateKanaStatistics,
  getStatisticsByScript,
  exportStatisticsAsBase64,
  importStatisticsFromBase64,
  getBestStreak,
  updateBestStreak,
  getDailyStreak,
  recordPracticeDay,
  getWeakKana,
  scheduleReview,
  getDueKana
} from './statisticsManager.js';

const STORAGE_KEY = 'kana-quiz-statistics';

// Build a base64 payload in the v2.0 compact export format
const makeBase64 = (entries, extra = {}) => {
  const data = { v: '2.0', d: new Date().toISOString(), s: entries, ...extra };
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
};

beforeEach(() => {
  localStorage.clear();
});

describe('saveStatistics / getStatistics schema handling (#84, #45)', () => {
  it('writes a versioned blob and reads back the flat stats map', () => {
    const map = { 'あ-a': { kana: 'あ', romaji: 'a', script: 'hiragana', timesShown: 3, timesCorrect: 2, timesIncorrect: 1, lastSeen: null, averageResponseTime: 0, responseTimes: [] } };
    expect(saveStatistics(map)).toBe(true);

    const blob = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(blob.schemaVersion).toBeGreaterThanOrEqual(1);
    expect(blob.stats['あ-a'].timesShown).toBe(3);

    expect(getStatistics()).toEqual(map);
  });

  it('migrates a legacy raw-map blob (no schemaVersion) losslessly', () => {
    const legacy = { 'か-ka': { kana: 'か', romaji: 'ka', script: 'hiragana', timesShown: 5, timesCorrect: 4, timesIncorrect: 1, lastSeen: null, averageResponseTime: 0, responseTimes: [] } };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));

    const stats = getStatistics();
    expect(stats['か-ka'].timesShown).toBe(5);
    expect(stats['か-ka'].timesCorrect).toBe(4);
  });

  it('returns false when localStorage throws (QuotaExceeded)', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });
    expect(saveStatistics({ 'あ-a': {} })).toBe(false);
    spy.mockRestore();
  });
});

describe('updateKanaStatistics (#83)', () => {
  it('writes multiple entries in a single pass', () => {
    const updated = updateKanaStatistics([
      { kana: 'あ', romaji: 'a', isCorrect: true, responseTime: 100 },
      { kana: 'ア', romaji: 'a', isCorrect: false, responseTime: 200 }
    ]);

    expect(updated).toHaveLength(2);
    const stats = getStatistics();
    expect(stats['あ-a'].timesCorrect).toBe(1);
    expect(stats['あ-a'].script).toBe('hiragana');
    expect(stats['ア-a'].timesIncorrect).toBe(1);
    expect(stats['ア-a'].script).toBe('katakana');
  });

  it('singular updateKanaStatistic still works and accumulates', () => {
    updateKanaStatistic('き', 'ki', true, 50);
    const stat = updateKanaStatistic('き', 'ki', false, 150);
    expect(stat.timesShown).toBe(2);
    expect(stat.timesCorrect).toBe(1);
    expect(stat.timesIncorrect).toBe(1);
    expect(stat.averageResponseTime).toBe(100);
  });
});

describe('getStatisticsByScript / scriptOf (#100)', () => {
  it('puts katakana into the katakana bucket', () => {
    updateKanaStatistic('ア', 'a', true);
    const byScript = getStatisticsByScript();
    expect(byScript.katakana.map(s => s.kana)).toContain('ア');
    expect(byScript.hiragana).toHaveLength(0);
  });

  it('does not silently classify an unknown script as katakana', () => {
    saveStatistics({
      'x-x': { kana: 'x', romaji: 'x', script: 'bogus', timesShown: 1, timesCorrect: 0, timesIncorrect: 1, lastSeen: null, averageResponseTime: 0, responseTimes: [] }
    });
    const byScript = getStatisticsByScript();
    expect(byScript.katakana).toHaveLength(0);
    expect(byScript.hiragana).toHaveLength(0);
  });
});

describe('importStatisticsFromBase64 merge (#3)', () => {
  it('merges additively into existing progress without data loss', () => {
    updateKanaStatistic('あ', 'a', true); // existing: shown 1, correct 1
    const code = makeBase64([{ k: 'あ', r: 'a', s: 3, c: 2, i: 1 }]);

    const res = importStatisticsFromBase64(code);
    expect(res.success).toBe(true);

    const stat = getStatistics()['あ-a'];
    expect(stat.timesShown).toBe(4);   // 1 + 3
    expect(stat.timesCorrect).toBe(3); // 1 + 2
    expect(stat.timesIncorrect).toBe(1);
  });

  it('replace mode overwrites instead of merging', () => {
    updateKanaStatistic('あ', 'a', true);
    const code = makeBase64([{ k: 'あ', r: 'a', s: 3, c: 2, i: 1 }]);

    importStatisticsFromBase64(code, { mode: 'replace' });
    expect(getStatistics()['あ-a'].timesShown).toBe(3);
  });

  it('round-trips an export back into the same numbers', () => {
    updateKanaStatistic('さ', 'sa', true);
    updateKanaStatistic('さ', 'sa', false);
    const code = exportStatisticsAsBase64();
    localStorage.clear();

    importStatisticsFromBase64(code);
    const stat = getStatistics()['さ-sa'];
    expect(stat.timesShown).toBe(2);
    expect(stat.timesCorrect).toBe(1);
    expect(stat.timesIncorrect).toBe(1);
  });
});

describe('importStatisticsFromBase64 validation (#28)', () => {
  it('discards entries without romaji but keeps valid ones (no throw)', () => {
    const code = makeBase64([
      { k: 'あ', r: 'a', s: 2, c: 2, i: 0 },
      { k: 'い', s: 1, c: 1, i: 0 } // missing romaji -> discarded
    ]);

    const res = importStatisticsFromBase64(code);
    expect(res.success).toBe(true);
    const stats = getStatistics();
    expect(stats['あ-a']).toBeDefined();
    expect(Object.keys(stats)).toHaveLength(1);
  });

  it('returns success:false on corrupt/truncated base64 without throwing', () => {
    const res = importStatisticsFromBase64('!!!not-valid-base64!!!');
    expect(res.success).toBe(false);
  });

  it('returns success:false when all entries are invalid', () => {
    const code = makeBase64([{ nonsense: true }, { k: '', r: '' }]);
    const res = importStatisticsFromBase64(code);
    expect(res.success).toBe(false);
  });

  it('does not corrupt existing progress on a failed import', () => {
    updateKanaStatistic('あ', 'a', true);
    importStatisticsFromBase64('garbage');
    expect(getStatistics()['あ-a'].timesShown).toBe(1);
  });
});

describe('best streak persistence (#53)', () => {
  it('defaults to 0', () => {
    expect(getBestStreak()).toBe(0);
  });

  it('persists and only stores records', () => {
    let res = updateBestStreak(5);
    expect(res).toEqual({ bestStreak: 5, isRecord: true });
    expect(getBestStreak()).toBe(5);

    res = updateBestStreak(3);
    expect(res).toEqual({ bestStreak: 5, isRecord: false });
    expect(getBestStreak()).toBe(5);

    res = updateBestStreak(8);
    expect(res).toEqual({ bestStreak: 8, isRecord: true });
    expect(getBestStreak()).toBe(8);
  });
});

describe('daily practice streak (#7)', () => {
  it('defaults to an empty streak', () => {
    expect(getDailyStreak()).toEqual({ current: 0, longest: 0, lastPracticeDate: null });
  });

  it('increments on consecutive days and keeps the longest', () => {
    recordPracticeDay(new Date(2026, 0, 1));
    recordPracticeDay(new Date(2026, 0, 2));
    let streak = recordPracticeDay(new Date(2026, 0, 3));
    expect(streak.current).toBe(3);
    expect(streak.longest).toBe(3);
    expect(streak.lastPracticeDate).toBe('2026-01-03');

    // A gap resets current to 1 but longest is retained
    streak = recordPracticeDay(new Date(2026, 0, 6));
    expect(streak.current).toBe(1);
    expect(streak.longest).toBe(3);
    expect(getDailyStreak().current).toBe(1);
  });

  it('counts practicing twice on the same day only once', () => {
    recordPracticeDay(new Date(2026, 0, 1));
    const streak = recordPracticeDay(new Date(2026, 0, 1));
    expect(streak.current).toBe(1);
    expect(streak.lastPracticeDate).toBe('2026-01-01');
  });
});

describe('getWeakKana (#9)', () => {
  beforeEach(() => {
    // strong: 5/5 correct; weak: 1/5 correct; too few attempts to judge
    saveStatistics({
      'あ-a': { kana: 'あ', romaji: 'a', script: 'hiragana', timesShown: 5, timesCorrect: 5, timesIncorrect: 0, lastSeen: null, averageResponseTime: 0, responseTimes: [] },
      'い-i': { kana: 'い', romaji: 'i', script: 'hiragana', timesShown: 5, timesCorrect: 1, timesIncorrect: 4, lastSeen: null, averageResponseTime: 0, responseTimes: [] },
      'う-u': { kana: 'う', romaji: 'u', script: 'hiragana', timesShown: 1, timesCorrect: 0, timesIncorrect: 1, lastSeen: null, averageResponseTime: 0, responseTimes: [] }
    });
  });

  it('returns exactly the weak kana, not the strong or under-attempted ones', () => {
    const weak = getWeakKana();
    expect(weak.map(s => s.kana)).toEqual(['い']);
  });

  it('respects a lowered minAttempts threshold', () => {
    const weak = getWeakKana({ minAttempts: 1 });
    expect(weak.map(s => s.kana).sort()).toEqual(['い', 'う']);
  });
});

describe('spaced repetition scheduling (#12)', () => {
  it('schedules a correct answer further out than a wrong one', () => {
    const now = new Date(2026, 0, 1, 12, 0, 0);
    updateKanaStatistic('か', 'ka', true);
    updateKanaStatistic('き', 'ki', false);

    const correct = scheduleReview('か-ka', true, now);
    const wrong = scheduleReview('き-ki', false, now);

    expect(correct.box).toBe(1);
    expect(wrong.box).toBe(0);
    expect(Date.parse(correct.dueAt)).toBeGreaterThan(Date.parse(wrong.dueAt));
  });

  it('getDueKana filters by due date', () => {
    const now = new Date(2026, 0, 1, 12, 0, 0);
    updateKanaStatistic('か', 'ka', true);
    scheduleReview('か-ka', true, now); // box 1 -> due in 1 day

    // Same instant: not yet due
    expect(getDueKana(['か-ka'], now)).toEqual([]);
    // Two days later: due
    const later = new Date(now.getTime() + 2 * 86400000);
    expect(getDueKana(['か-ka'], later)).toEqual(['か-ka']);
  });

  it('treats kana without SR fields as due immediately', () => {
    updateKanaStatistic('こ', 'ko', true); // no scheduleReview -> no dueAt
    expect(getDueKana(['こ-ko'])).toEqual(['こ-ko']);
    // An entirely unknown candidate key is also due (never seen)
    expect(getDueKana(['ぬ-nu'])).toEqual(['ぬ-nu']);
  });
});
