import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App, { decodeChallenge } from './App.jsx'
import i18n from './i18n/i18n.js'
import { hiragana } from './data/kana.js'

// Statically-rendered KanaSelection carries this literal heading — a stable anchor
// for "are we on the selection screen?" that doesn't depend on translations.
const SELECTION_MARKER = /Hiragana & Katakana/

// #22: mirror the encoder in QuizResults so the test can build a valid challenge.
const encodeChallenge = (chars) =>
  encodeURIComponent(btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(chars)))))

afterEach(async () => {
  // Clear any challenge param a test set on the URL.
  window.history.replaceState(null, '', '/')
  // i18n is a singleton shared across tests; reset to the default language.
  await act(async () => {
    await i18n.changeLanguage('de')
  })
})

describe('App', () => {
  it('renders the initial selection screen without crashing', () => {
    render(<App />)
    expect(screen.getByText(SELECTION_MARKER)).toBeInTheDocument()
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
    expect(screen.getByText(SELECTION_MARKER)).toBeInTheDocument()

    // Forward navigation pushes a history entry and swaps the view.
    // (#51 turned the prominent 📊 button into a deemphasized "view statistics" link.)
    await user.click(screen.getByRole('button', { name: /Statistik|statistics/i }))
    await waitFor(() =>
      expect(screen.queryByText(SELECTION_MARKER)).not.toBeInTheDocument()
    )

    // Browser-back (base entry has no view state) is the only source of the reverse switch.
    await act(async () => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }))
    })
    expect(await screen.findByText(SELECTION_MARKER)).toBeInTheDocument()
  })

  it('#4: study flow leads from selection into study and then the quiz', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('checkbox', { name: /Vokale/i }))
    await user.click(screen.getByRole('button', { name: /Erst lernen/i }))

    // The lazy study screen appears in place of the selection.
    expect(await screen.findByText(/Zeichen lernen/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Quiz starten/i }))

    // The quiz screen is up: its romaji input is the stable anchor.
    expect(await screen.findByPlaceholderText(/Romaji/i)).toBeInTheDocument()
  })

  it('#22: decodeChallenge resolves valid kana and ignores garbage', () => {
    const chars = hiragana.slice(0, 5).map((k) => k.kana)
    const raw = btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(chars))))

    const resolved = decodeChallenge(raw)
    expect(resolved.map((k) => k.kana)).toEqual(chars)

    // Broken parameter must not throw and yields an empty list.
    expect(decodeChallenge('not-base64!!!')).toEqual([])
  })

  it('#22: a ?challenge= link starts the quiz and strips the param', async () => {
    const chars = hiragana.slice(0, 5).map((k) => k.kana)
    window.history.replaceState({}, '', `/?challenge=${encodeChallenge(chars)}`)

    render(<App />)

    // Deep-linked straight into the quiz, bypassing the selection screen.
    expect(await screen.findByPlaceholderText(/Romaji/i)).toBeInTheDocument()
    // The param is removed so a reload does not retrigger the challenge.
    expect(window.location.search).toBe('')
  })
})
