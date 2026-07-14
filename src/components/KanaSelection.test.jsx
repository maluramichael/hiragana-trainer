import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '../i18n/i18n.js';
import KanaSelection from './KanaSelection.jsx';

const SELECTION_KEY = 'kana-quiz-selection';
const STATS_KEY = 'kana-quiz-statistics';

// Seed the statistics blob in the shape statisticsManager expects (schema v2).
const seedStats = (stats) => {
  localStorage.setItem(STATS_KEY, JSON.stringify({ schemaVersion: 2, stats }));
};

const statEntry = (overrides) => ({
  kana: 'か',
  romaji: 'ka',
  script: 'hiragana',
  timesShown: 0,
  timesCorrect: 0,
  timesIncorrect: 0,
  lastSeen: null,
  averageResponseTime: 0,
  responseTimes: [],
  ...overrides
});

describe('KanaSelection', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('#2: quickstart sends first-timers into study (learn before quiz) with a non-empty selection', async () => {
    const user = userEvent.setup();
    const onStudy = vi.fn();
    render(<KanaSelection onStartQuiz={vi.fn()} onStudy={onStudy} onViewStatistics={vi.fn()} />);

    await user.click(screen.getByTestId('quickstart-button'));

    expect(onStudy).toHaveBeenCalledTimes(1);
    const kana = onStudy.mock.calls[0][0];
    expect(Array.isArray(kana)).toBe(true);
    expect(kana.length).toBeGreaterThan(0);
  });

  it('#51: first-run picker keeps only the basic group expanded', () => {
    render(<KanaSelection onStartQuiz={vi.fn()} onStudy={vi.fn()} onViewStatistics={vi.fn()} />);
    // One collapse toggle per group; aria-label ends in "…ausklappen".
    const toggles = screen.getAllByRole('button', { name: /ausklappen/i });
    expect(toggles).toHaveLength(3);
    expect(toggles[0]).toHaveAttribute('aria-expanded', 'true');  // basic
    expect(toggles[1]).toHaveAttribute('aria-expanded', 'false'); // dakuten
    expect(toggles[2]).toHaveAttribute('aria-expanded', 'false'); // handakuten
  });

  it('#18: the selection is persisted to localStorage and restored on remount', async () => {
    const user = userEvent.setup();

    const { unmount } = render(
      <KanaSelection onStartQuiz={vi.fn()} onViewStatistics={vi.fn()} />
    );

    const vowels = screen.getByRole('checkbox', { name: /Vokale/i });
    expect(vowels).not.toBeChecked();
    await user.click(vowels);

    const stored = localStorage.getItem(SELECTION_KEY);
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored).basicSubs.vowels).toBe(true);

    unmount();
    render(<KanaSelection onStartQuiz={vi.fn()} onViewStatistics={vi.fn()} />);

    expect(screen.getByRole('checkbox', { name: /Vokale/i })).toBeChecked();
  });

  it('#46: the selected character count is shown once something is selected', async () => {
    const user = userEvent.setup();
    render(<KanaSelection onStartQuiz={vi.fn()} onViewStatistics={vi.fn()} />);

    await user.click(screen.getByRole('checkbox', { name: /Vokale/i }));

    // Vowels: 5 hiragana + 5 katakana = 10 characters.
    expect(screen.getByText(/10 Zeichen ausgewählt/)).toBeInTheDocument();
  });

  // The two scripts are toggle tiles now: both on = "both", one on = that script.
  // Switching to katakana-only means turning Katakana on (→ both) then Hiragana off.
  it('#72: the script mode defaults to hiragana on first visit', () => {
    render(<KanaSelection onStartQuiz={vi.fn()} onViewStatistics={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Hiragana' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Katakana' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('#72: the script mode is persisted and restored on remount', async () => {
    const user = userEvent.setup();

    const { unmount } = render(
      <KanaSelection onStartQuiz={vi.fn()} onViewStatistics={vi.fn()} />
    );

    await user.click(screen.getByRole('button', { name: 'Katakana' }));
    await user.click(screen.getByRole('button', { name: 'Hiragana' }));
    expect(localStorage.getItem('kana-quiz-script-mode')).toBe('katakana');

    unmount();
    render(<KanaSelection onStartQuiz={vi.fn()} onViewStatistics={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Katakana' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Hiragana' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('#72: the chosen script mode is handed to onStudy from quickstart', async () => {
    const user = userEvent.setup();
    const onStudy = vi.fn();
    render(<KanaSelection onStartQuiz={vi.fn()} onStudy={onStudy} onViewStatistics={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Katakana' }));
    await user.click(screen.getByRole('button', { name: 'Hiragana' }));
    await user.click(screen.getByTestId('quickstart-button'));

    expect(onStudy.mock.calls[0][1]).toEqual({ scriptMode: 'katakana', intro: true });
  });

  it('#4: the "study first" button hands the current selection to onStudy', async () => {
    const user = userEvent.setup();
    const onStudy = vi.fn();
    render(
      <KanaSelection onStartQuiz={vi.fn()} onStudy={onStudy} onViewStatistics={vi.fn()} />
    );

    await user.click(screen.getByRole('checkbox', { name: /Vokale/i }));
    await user.click(screen.getByRole('button', { name: /Erst lernen/i }));

    expect(onStudy).toHaveBeenCalledTimes(1);
    const [list, options] = onStudy.mock.calls[0];
    expect(list.length).toBeGreaterThan(0);
    // Default script mode on first visit is hiragana (#72).
    expect(options).toEqual({ scriptMode: 'hiragana' });
  });

  it('#9: the weak-kana button is hidden without weak kana', () => {
    render(<KanaSelection onStartQuiz={vi.fn()} onStudy={vi.fn()} onViewStatistics={vi.fn()} />);

    expect(
      screen.queryByRole('button', { name: /Schwache Zeichen üben/i })
    ).not.toBeInTheDocument();
  });

  it('#9: the weak-kana button starts a quiz with exactly the weak kana', async () => {
    const user = userEvent.setup();
    const onStartQuiz = vi.fn();

    // か answered mostly wrong (4 attempts, 25% accuracy) counts as weak.
    seedStats({
      'か-ka': statEntry({ timesShown: 4, timesCorrect: 1, timesIncorrect: 3 })
    });

    render(
      <KanaSelection onStartQuiz={onStartQuiz} onStudy={vi.fn()} onViewStatistics={vi.fn()} />
    );

    const weakButton = await screen.findByRole('button', {
      name: /Schwache Zeichen üben/i
    });
    await user.click(weakButton);

    expect(onStartQuiz).toHaveBeenCalledTimes(1);
    const [list, options] = onStartQuiz.mock.calls[0];
    expect(list).toHaveLength(1);
    expect(list[0].kana).toBe('か');
    expect(list[0].romaji).toBe('ka');
    expect(options).toEqual({ scriptMode: 'hiragana' });
  });

  it('#12: the due-kana button starts a quiz with the due kana', async () => {
    const user = userEvent.setup();
    const onStartQuiz = vi.fn();

    // Practiced katakana カ whose review interval already elapsed (not weak).
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    seedStats({
      'カ-ka': statEntry({
        kana: 'カ',
        script: 'katakana',
        timesShown: 5,
        timesCorrect: 5,
        box: 1,
        dueAt: yesterday
      })
    });

    render(
      <KanaSelection onStartQuiz={onStartQuiz} onStudy={vi.fn()} onViewStatistics={vi.fn()} />
    );

    const dueButton = await screen.findByRole('button', {
      name: /Fällige Zeichen wiederholen/i
    });
    await user.click(dueButton);

    expect(onStartQuiz).toHaveBeenCalledTimes(1);
    const [list, options] = onStartQuiz.mock.calls[0];
    expect(list).toHaveLength(1);
    expect(list[0].kana).toBe('カ');
    expect(options).toEqual({ scriptMode: 'katakana' });
  });
});
