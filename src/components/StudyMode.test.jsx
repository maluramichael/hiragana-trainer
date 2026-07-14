import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '../i18n/i18n.js';
import StudyMode from './StudyMode.jsx';

const kanaList = [
  { kana: 'あ', romaji: 'a' },
  { kana: 'い', romaji: 'i' },
  { kana: 'ア', romaji: 'a' },
  { kana: 'イ', romaji: 'i' }
];

describe('StudyMode', () => {
  it('#4: shows the first card with its kana and romaji', () => {
    render(
      <StudyMode kanaList={kanaList} scriptMode="both" onStartQuiz={vi.fn()} onBack={vi.fn()} />
    );

    expect(screen.getByText('あ')).toBeInTheDocument();
    // Romaji of the first card is visible alongside the kana.
    expect(screen.getAllByText('a').length).toBeGreaterThan(0);
    expect(screen.getByText(/Karte 1 von 4/)).toBeInTheDocument();
  });

  it('#4: flips forward and back through the cards', async () => {
    const user = userEvent.setup();
    render(
      <StudyMode kanaList={kanaList} scriptMode="both" onStartQuiz={vi.fn()} onBack={vi.fn()} />
    );

    expect(screen.getByText('あ')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^Weiter$/i }));
    expect(screen.getByText('い')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^Zurück$/i }));
    expect(screen.getByText('あ')).toBeInTheDocument();
  });

  it('#4: the last card starts the quiz with the full list and script mode', async () => {
    const user = userEvent.setup();
    const onStartQuiz = vi.fn();
    render(
      <StudyMode kanaList={kanaList} scriptMode="both" onStartQuiz={onStartQuiz} onBack={vi.fn()} />
    );

    // Forward is "Weiter" until the last card, where it becomes "Jetzt Quiz starten".
    await user.click(screen.getByRole('button', { name: /^Weiter$/i }));
    await user.click(screen.getByRole('button', { name: /^Weiter$/i }));
    await user.click(screen.getByRole('button', { name: /^Weiter$/i }));
    await user.click(screen.getByRole('button', { name: /Quiz starten/i }));

    expect(onStartQuiz).toHaveBeenCalledWith(kanaList, { scriptMode: 'both' });
  });

  it('#onboarding: showIntro opens the writing-system intro before the cards', async () => {
    const user = userEvent.setup();
    render(
      <StudyMode kanaList={kanaList} scriptMode="both" showIntro onStartQuiz={vi.fn()} onBack={vi.fn()} />
    );

    // Intro first, no card yet.
    expect(screen.getByText(/So funktioniert japanische Schrift/)).toBeInTheDocument();
    expect(screen.queryByText('あ')).not.toBeInTheDocument();

    // The CTA reveals the flashcards.
    await user.click(screen.getByRole('button', { name: /Zeig mir die Vokale/i }));
    expect(screen.getByText('あ')).toBeInTheDocument();
  });

  it('#4: shows only hiragana cards in hiragana mode', () => {
    render(
      <StudyMode kanaList={kanaList} scriptMode="hiragana" onStartQuiz={vi.fn()} onBack={vi.fn()} />
    );

    // Only あ and い remain, so the deck is two cards long.
    expect(screen.getByText(/Karte 1 von 2/)).toBeInTheDocument();
    expect(screen.getByText('あ')).toBeInTheDocument();
    expect(screen.queryByText('ア')).not.toBeInTheDocument();
  });
});
