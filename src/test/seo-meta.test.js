import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'

// vitest runs from the project root, so relative paths resolve against it.
const read = (p) => readFileSync(p, 'utf-8')

describe('index.html SEO/meta', () => {
  const html = read('index.html')

  it('uses the canonical domain in og:url and twitter:url', () => {
    expect(html).toContain('property="og:url" content="https://hiragana-trainer.de/"')
    expect(html).toContain('property="twitter:url" content="https://hiragana-trainer.de/"')
  })

  it('no longer points og:url at the bare malura.de root', () => {
    expect(html).not.toContain('content="https://malura.de/"')
  })

  it('references an og:image', () => {
    expect(html).toContain('property="og:image"')
    // #7: PNG, weil viele Plattformen SVG-OG-Images nicht rendern.
    expect(html).toContain('og-image.png')
  })

  it('declares lang="de"', () => {
    expect(html).toContain('lang="de"')
  })

  it('uses the canonical display name "Hiragana Trainer"', () => {
    expect(html).toContain('Hiragana Trainer')
    expect(html).not.toContain('Kana Quiz')
  })

  it('embeds a SoftwareApplication JSON-LD block', () => {
    expect(html).toContain('application/ld+json')
    expect(html).toContain('"@type": "SoftwareApplication"')
  })

  it('hat kein Inline-Script und keine Inline-Handler (CSP ohne unsafe-inline)', () => {
    const scripts = [...html.matchAll(/<script\b([^>]*)>/g)].map((m) => m[1])
    for (const attrs of scripts) {
      expect(attrs).toMatch(/type="(module|application\/ld\+json)"/)
    }
    expect(html).not.toMatch(/\sonclick=/)
    expect(html).toContain('id="cookie-accept"')
    expect(html).toContain('id="cookie-reject"')
  })
})

describe('public/ static assets', () => {
  const files = [
    'public/robots.txt',
    'public/sitemap.xml',
    'public/llms.txt',
    'public/favicon.svg',
    'public/og-image.svg',
  ]

  it('all exist and are non-empty', () => {
    for (const f of files) {
      expect(read(f).trim().length).toBeGreaterThan(0)
    }
  })

  it('robots.txt references the sitemap', () => {
    expect(read('public/robots.txt')).toContain(
      'Sitemap: https://hiragana-trainer.de/sitemap.xml',
    )
  })

  it('sitemap.xml lists the canonical URL', () => {
    expect(read('public/sitemap.xml')).toContain('https://hiragana-trainer.de/')
  })
})
