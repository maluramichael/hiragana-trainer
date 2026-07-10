import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LandingPage from './LandingPage.jsx'
import '../i18n/i18n.js'

describe('LandingPage', () => {
  it('renders an <h1> and an accessible "Lerne die Vokale" button', () => {
    render(<LandingPage onStart={() => {}} onChooseCharacters={() => {}} />)

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Lerne die Vokale/i })).toBeInTheDocument()
  })

  it('calls onStart when the primary CTA is clicked', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    render(<LandingPage onStart={onStart} onChooseCharacters={() => {}} />)

    await user.click(screen.getByRole('button', { name: /Lerne die Vokale/i }))
    expect(onStart).toHaveBeenCalledOnce()
  })

  it('calls onChooseCharacters when the secondary link is clicked', async () => {
    const user = userEvent.setup()
    const onChooseCharacters = vi.fn()
    render(<LandingPage onStart={() => {}} onChooseCharacters={onChooseCharacters} />)

    await user.click(screen.getByRole('button', { name: /Wähle andere Zeichen/i }))
    expect(onChooseCharacters).toHaveBeenCalledOnce()
  })
})
