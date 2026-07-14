import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LandingPage from './LandingPage.jsx'
import '../i18n/i18n.js'

describe('LandingPage', () => {
  it('renders an <h1> and the prominent first-run CTA', () => {
    render(<LandingPage onStart={() => {}} />)

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    // No stats -> first-run label.
    expect(screen.getByRole('button', { name: /Los geht's/i })).toBeInTheDocument()
  })

  it('calls onStart when the primary CTA is clicked', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    render(<LandingPage onStart={onStart} />)

    await user.click(screen.getByRole('button', { name: /Los geht's/i }))
    expect(onStart).toHaveBeenCalledOnce()
  })

  it('#32: "how it works" opens the writing-system explainer modal', async () => {
    const user = userEvent.setup()
    render(<LandingPage onStart={() => {}} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Wie funktioniert japanische Schrift/i }))
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    // The writing-system explanation (incl. the kanji note) is present.
    expect(screen.getByText(/So funktioniert japanische Schrift/)).toBeInTheDocument()
    expect(screen.getAllByText(/Kanji/).length).toBeGreaterThan(0)
  })
})
