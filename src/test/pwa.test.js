import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'

// vitest runs from the project root, so relative paths resolve against it.
const read = (p) => readFileSync(p, 'utf-8')

describe('PWA manifest', () => {
  const manifest = JSON.parse(read('public/manifest.webmanifest'))

  it('is valid JSON with the required fields', () => {
    expect(manifest.name).toBe('Hiragana Trainer')
    expect(manifest.start_url).toBe('/')
    expect(manifest.display).toBe('standalone')
  })

  it('declares at least one icon with a source', () => {
    expect(Array.isArray(manifest.icons)).toBe(true)
    expect(manifest.icons.length).toBeGreaterThan(0)
    for (const icon of manifest.icons) {
      expect(icon.src).toBeTruthy()
    }
  })
})

describe('PWA wiring', () => {
  it('index.html links the manifest', () => {
    expect(read('index.html')).toContain('rel="manifest"')
  })

  it('main.jsx registers the service worker only in production', () => {
    const main = read('src/main.jsx')
    expect(main).toContain('import.meta.env.PROD')
    expect(main).toContain("navigator.serviceWorker.register('/sw.js')")
  })

  it('service worker handles install and fetch', () => {
    const sw = read('public/sw.js')
    expect(sw).toContain("addEventListener('install'")
    expect(sw).toContain("addEventListener('fetch'")
  })
})
