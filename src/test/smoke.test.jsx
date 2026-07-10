import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { hiragana, katakana } from '../data/kana.js'

// Smoke test: verifies the Vitest + jsdom + RTL + jest-dom pipeline is wired up.
describe('test infrastructure', () => {
  it('runs vitest and can import app data', () => {
    expect(hiragana.length).toBeGreaterThan(0)
    expect(katakana.length).toBeGreaterThan(0)
  })

  it('renders into jsdom and jest-dom matchers work', () => {
    render(<span>あ</span>)
    expect(screen.getByText('あ')).toBeInTheDocument()
  })

  it('has a clean localStorage per test', () => {
    expect(localStorage.getItem('anything')).toBeNull()
    localStorage.setItem('anything', '1')
    expect(localStorage.getItem('anything')).toBe('1')
  })
})
