import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const conf = readFileSync(resolve(__dirname, '../../nginx.conf'), 'utf-8')

describe('nginx security headers', () => {
  const headers = [
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Referrer-Policy',
    'Permissions-Policy',
    'Content-Security-Policy',
  ]

  it.each(headers)('setzt den Header %s', (name) => {
    expect(conf).toContain(name)
  })

  it('setzt X-Frame-Options auf DENY', () => {
    expect(conf).toMatch(/X-Frame-Options\s+"DENY"/)
  })

  it('setzt X-Content-Type-Options auf nosniff', () => {
    expect(conf).toContain('nosniff')
  })

  it('erlaubt analytics.malura.de in der CSP', () => {
    expect(conf).toContain('analytics.malura.de')
  })

  it('setzt frame-ancestors none in der CSP', () => {
    expect(conf).toContain("frame-ancestors 'none'")
  })

  it('wiederholt die Security-Header im Asset-Block (mehrfaches Vorkommen)', () => {
    const count = (conf.match(/Content-Security-Policy/g) || []).length
    expect(count).toBeGreaterThanOrEqual(2)
  })
})
