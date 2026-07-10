import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'
import i18n from './i18n/i18n.js'

// Statically-rendered KanaSelection carries this literal heading — a stable anchor
// for "are we on the selection screen?" that doesn't depend on translations.
const SELECTION_MARKER = /Hiragana & Katakana/

afterEach(async () => {
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
})
