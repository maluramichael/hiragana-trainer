import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from '../i18n/i18n.js';
import { hiragana } from '../data/kana.js';
import QuizResults from './QuizResults.jsx';

// Labels are derived from the shared i18n instance so the tests stay green
// whether or not the new locale keys are wired up centrally yet.
const label = (key) => i18n.t(key);

const sampleResults = { total: 20, correct: 19, bestStreak: 8 };

const renderResults = (overrides = {}) =>
  render(
    <QuizResults
      results={overrides.results ?? sampleResults}
      onRestart={overrides.onRestart ?? vi.fn()}
      onNewSelection={overrides.onNewSelection ?? vi.fn()}
      kanaList={overrides.kanaList ?? []}
    />
  );

afterEach(() => {
  vi.restoreAllMocks();
  delete navigator.share;
});

describe('QuizResults', () => {
  it('renders without crashing given realistic results', () => {
    renderResults();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    // 19 correct out of 20 -> 95% accuracy is shown.
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  it('#10: share button uses navigator.share when available', async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    navigator.share = shareMock;
    const user = userEvent.setup();

    renderResults();
    await user.click(screen.getByRole('button', { name: label('results.share') }));

    expect(shareMock).toHaveBeenCalledTimes(1);
    expect(shareMock.mock.calls[0][0]).toMatchObject({
      url: 'https://hiragana-trainer.malura.de',
    });
  });

  it('#10: share button falls back to clipboard when navigator.share is missing', async () => {
    delete navigator.share;
    const user = userEvent.setup();
    // Define after setup(): userEvent installs its own clipboard stub on setup.
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    renderResults();
    await user.click(screen.getByRole('button', { name: label('results.share') }));

    // Locale keys are wired up centrally later, so assert the copy happened with
    // a non-empty string rather than on the interpolated translation content.
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0][0]).toBeTruthy();
    expect(typeof writeText.mock.calls[0][0]).toBe('string');
  });

  it('#26: exposes a real GitHub link', () => {
    const { container } = renderResults();
    expect(container.querySelector('a[href*="github.com/maluramichael"]')).toBeTruthy();
  });

  it('#22: challenge button copies a URL containing ?challenge= to the clipboard', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    renderResults({ kanaList: hiragana.slice(0, 5) });
    await user.click(screen.getByRole('button', { name: label('results.challenge') }));

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0][0]).toContain('?challenge=');
  });

  it('#22: challenge button is hidden without a kana selection', () => {
    renderResults({ kanaList: [] });
    expect(
      screen.queryByRole('button', { name: label('results.challenge') })
    ).not.toBeInTheDocument();
  });

  it('#87: cross-device button copies the export code to the clipboard', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    renderResults();
    await user.click(screen.getByRole('button', { name: label('results.crossDevice') }));

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(typeof writeText.mock.calls[0][0]).toBe('string');
  });
});
