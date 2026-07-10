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
  updateBestStreak
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
