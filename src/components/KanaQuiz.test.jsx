import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '../i18n/i18n.js';
import KanaQuiz from './KanaQuiz.jsx';
import { hiragana, katakana } from '../data/kana.js';
import { getStatistics } from '../utils/statisticsManager.js';

const hi = (romaji) => hiragana.find((k) => k.romaji === romaji);
const ka = (romaji) => katakana.find((k) => k.romaji === romaji);

// Mimic KanaSelection: a selection contains both the hiragana and katakana
// object of each chosen character.
const pair = (romaji) => [hi(romaji), ka(romaji)];

describe('KanaQuiz', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('#1 + #83: each kana counts exactly once (both scripts asked separately)', async () => {
    const user = userEvent.setup();
    render(<KanaQuiz kanaList={pair('a')} onFinish={vi.fn()} />);

    // Both mode asks the two scripts as separate, alternating questions.
    // Each Enter submits once (no double count), stats written once per kana.
    await user.type(screen.getByRole('textbox'), 'a{Enter}');
    await user.click(screen.getByRole('button', { name: /weiter|next/i }));
    await user.type(screen.getByRole('textbox'), 'a{Enter}');

    const stats = getStatistics();
    expect(stats['あ-a'].timesShown).toBe(1);
    expect(stats['ア-a'].timesShown).toBe(1);
    expect(stats['あ-a'].timesCorrect).toBe(1);
  });

  it('#29: an alternative romanization (si for し) is accepted', async () => {
    const user = userEvent.setup();
    render(<KanaQuiz kanaList={pair('shi')} scriptMode="hiragana" onFinish={vi.fn()} />);

    await user.type(screen.getByRole('textbox'), 'si{Enter}');

    const stats = getStatistics();
    expect(stats['し-shi'].timesCorrect).toBe(1);
    expect(stats['し-shi'].timesIncorrect).toBe(0);
  });

  it('#15/#69: a wrong answer is announced assertively (role=alert)', async () => {
    const user = userEvent.setup();
    render(<KanaQuiz kanaList={pair('a')} onFinish={vi.fn()} />);

    // Wrong answer -> FeedbackBanner uses role="alert" (the polite quiz-question
    // announce region is role="status", so alert is unambiguous here).
    await user.type(screen.getByRole('textbox'), 'x{Enter}');

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('#65: feedback shows a control button instead of auto-advancing', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(<KanaQuiz kanaList={pair('a')} scriptMode="hiragana" onFinish={onFinish} />);

    await user.type(screen.getByRole('textbox'), 'a{Enter}');

    // Single hiragana question -> the advance control finishes the quiz on click.
    const advance = screen.getByRole('button', { name: /beenden|finish/i });
    await user.click(advance);

    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onFinish.mock.calls[0][0]).toMatchObject({ total: 1, correct: 1 });
  });

  it('#64: leaving at the first question needs no confirm and reports abort', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(<KanaQuiz kanaList={pair('a')} onFinish={onFinish} />);

    await user.click(screen.getByRole('button', { name: /zurück|back/i }));

    expect(onFinish).toHaveBeenCalledWith(null);
  });

  it('#72: hiragana mode tracks only the hiragana kana', async () => {
    const user = userEvent.setup();
    render(<KanaQuiz kanaList={pair('a')} scriptMode="hiragana" onFinish={vi.fn()} />);

    await user.type(screen.getByRole('textbox'), 'a{Enter}');

    const stats = getStatistics();
    expect(stats['あ-a']).toBeDefined();
    expect(stats['ア-a']).toBeUndefined();
  });

  it('#72: katakana mode tracks only the katakana kana', async () => {
    const user = userEvent.setup();
    render(<KanaQuiz kanaList={pair('a')} scriptMode="katakana" onFinish={vi.fn()} />);

    await user.type(screen.getByRole('textbox'), 'a{Enter}');

    const stats = getStatistics();
    expect(stats['ア-a']).toBeDefined();
    expect(stats['あ-a']).toBeUndefined();
  });

  it('#72: both mode (the default) tracks both scripts', async () => {
    const user = userEvent.setup();
    render(<KanaQuiz kanaList={pair('a')} onFinish={vi.fn()} />);

    // Both scripts are asked as separate questions; answer both.
    await user.type(screen.getByRole('textbox'), 'a{Enter}');
    await user.click(screen.getByRole('button', { name: /weiter|next/i }));
    await user.type(screen.getByRole('textbox'), 'a{Enter}');

    const stats = getStatistics();
    expect(stats['あ-a']).toBeDefined();
    expect(stats['ア-a']).toBeDefined();
  });

  it('#12: answering schedules a spaced-repetition review for the kana', async () => {
    const user = userEvent.setup();
    render(<KanaQuiz kanaList={pair('a')} scriptMode="hiragana" onFinish={vi.fn()} />);

    await user.type(screen.getByRole('textbox'), 'a{Enter}');

    const stats = getStatistics();
    // A correct answer moves the kana from box 0 to box 1 and sets a due date.
    expect(stats['あ-a'].box).toBe(1);
    expect(stats['あ-a'].dueAt).toBeTruthy();
  });
});
