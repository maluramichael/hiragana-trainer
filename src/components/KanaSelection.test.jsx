import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '../i18n/i18n.js';
import KanaSelection from './KanaSelection.jsx';

const SELECTION_KEY = 'kana-quiz-selection';

describe('KanaSelection', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('#2: the quickstart button starts the quiz with a non-empty selection', async () => {
    const user = userEvent.setup();
    const onStartQuiz = vi.fn();
    render(<KanaSelection onStartQuiz={onStartQuiz} onViewStatistics={vi.fn()} />);

    await user.click(screen.getByTestId('quickstart-button'));

    expect(onStartQuiz).toHaveBeenCalledTimes(1);
    const kana = onStartQuiz.mock.calls[0][0];
    expect(Array.isArray(kana)).toBe(true);
    expect(kana.length).toBeGreaterThan(0);
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

  it('#72: the script mode defaults to hiragana on first visit', () => {
    render(<KanaSelection onStartQuiz={vi.fn()} onViewStatistics={vi.fn()} />);

    expect(screen.getByRole('radio', { name: /Nur Hiragana/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Nur Katakana/i })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: /^Beide$/i })).not.toBeChecked();
  });

  it('#72: the script mode is persisted and restored on remount', async () => {
    const user = userEvent.setup();

    const { unmount } = render(
      <KanaSelection onStartQuiz={vi.fn()} onViewStatistics={vi.fn()} />
    );

    await user.click(screen.getByRole('radio', { name: /Nur Katakana/i }));
    expect(localStorage.getItem('kana-quiz-script-mode')).toBe('katakana');

    unmount();
    render(<KanaSelection onStartQuiz={vi.fn()} onViewStatistics={vi.fn()} />);

    expect(screen.getByRole('radio', { name: /Nur Katakana/i })).toBeChecked();
  });

  it('#72: the chosen script mode is handed to onStartQuiz', async () => {
    const user = userEvent.setup();
    const onStartQuiz = vi.fn();
    render(<KanaSelection onStartQuiz={onStartQuiz} onViewStatistics={vi.fn()} />);

    await user.click(screen.getByRole('radio', { name: /Nur Katakana/i }));
    await user.click(screen.getByTestId('quickstart-button'));

    expect(onStartQuiz.mock.calls[0][1]).toEqual({ scriptMode: 'katakana' });
  });
});
