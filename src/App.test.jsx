import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'
import i18n from './i18n/i18n.js'
import { updateKanaStatistics } from './utils/statisticsManager.js'

// The redesigned selection screen shows the two scripts as toggle tiles; the
// hiragana tile's kana label ("ひらがな") is a stable, translation-independent
// anchor for "are we on the selection screen?".
const SELECTION_MARKER = /ひらがな/

// The app now opens on the landing page; its CTA is the stable anchor for
// "are we on the landing screen?". Helper to leave it for the picker.
const goToSelection = async (user) =>
  user.click(screen.getByRole('button', { name: /Wähle andere Zeichen/i }))

afterEach(async () => {
  // Clear any challenge param a test set on the URL.
  window.history.replaceState(null, '', '/')
  // i18n is a singleton shared across tests; reset to the default language.
  await act(async () => {
    await i18n.changeLanguage('de')
  })
})

describe('App', () => {
  it('renders the landing page as the initial screen', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Lerne die Vokale/i })).toBeInTheDocument()
    // The picker only appears after choosing to select characters.
    expect(screen.queryByText(SELECTION_MARKER)).not.toBeInTheDocument()
  })

  it('#2: first-run CTA teaches the vowels first, then flows into the quiz', async () => {
    const user = userEvent.setup()
    render(<App />)

    // No stats yet -> the CTA leads into StudyMode (flashcards), not straight to the quiz.
    await user.click(screen.getByRole('button', { name: /Lerne die Vokale/i }))
    const startQuiz = await screen.findByRole('button', { name: /Jetzt Quiz starten/i })

    // One click from study continues into the quiz on the same set.
    await user.click(startQuiz)
    expect(await screen.findByPlaceholderText(/Romaji/i)).toBeInTheDocument()
  })

  it('#2: a returning learner (has stats) goes straight into the quiz', async () => {
    const user = userEvent.setup()
    updateKanaStatistics([{ kana: 'あ', romaji: 'a', isCorrect: true, responseTime: 500 }])
    render(<App />)

    await user.click(screen.getByRole('button', { name: /Lerne die Vokale/i }))
    expect(await screen.findByPlaceholderText(/Romaji/i)).toBeInTheDocument()
  })

  it('landing secondary link leads to the selection screen', async () => {
    const user = userEvent.setup()
    render(<App />)

    await goToSelection(user)
    expect(await screen.findByText(SELECTION_MARKER)).toBeInTheDocument()
  })

  it('keeps <html lang> in sync with the i18n language (#14)', async () => {
    render(<App />)
    await waitFor(() => expect(document.documentElement.lang).toBe(i18n.language))

    await act(async () => {
      await i18n.changeLanguage('en')
    })
    expect(document.documentElement.lang).toBe('en')
  })

  it('navigates forward to statistics, and back to selection via popstate (#80)', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Leave the landing page for the picker first.
    await goToSelection(user)
    expect(await screen.findByText(SELECTION_MARKER)).toBeInTheDocument()

    // Forward navigation pushes a history entry and swaps the view.
    // (#51 turned the prominent 📊 button into a deemphasized "view statistics" link.)
    await user.click(screen.getByRole('button', { name: /Statistik|statistics/i }))
    await waitFor(() =>
      expect(screen.queryByText(SELECTION_MARKER)).not.toBeInTheDocument()
    )

    // Browser-back to the selection entry is the only source of the reverse switch.
    await act(async () => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: { view: 'selection' } }))
    })
    expect(await screen.findByText(SELECTION_MARKER)).toBeInTheDocument()
  })

  it('#4: study flow leads from selection into study and then the quiz', async () => {
    const user = userEvent.setup()
    render(<App />)

    await goToSelection(user)
    await user.click(await screen.findByRole('checkbox', { name: /Vokale/i }))
    await user.click(screen.getByRole('button', { name: /Erst lernen/i }))

    // The lazy study screen appears in place of the selection.
    expect(await screen.findByText(/Zeichen lernen/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Quiz starten/i }))

    // The quiz screen is up: its romaji input is the stable anchor.
    expect(await screen.findByPlaceholderText(/Romaji/i)).toBeInTheDocument()
  })

})
