import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { CookieConsent } from './consent.js'

function mountBanner() {
  document.body.innerHTML = `
    <div id="cookie-banner" class="hidden">
      <button id="cookie-reject" type="button">Ablehnen</button>
      <button id="cookie-accept" type="button">Akzeptieren</button>
    </div>`
}

describe('CookieConsent (#81)', () => {
  beforeEach(() => {
    mountBanner()
    delete window.owa_cmds
  })

  afterEach(() => {
    document.body.innerHTML = ''
    document.head.querySelectorAll('#owa-tracker').forEach((n) => n.remove())
    delete window.owa_cmds
    delete window.owa_baseUrl
  })

  it('zeigt das Banner ohne gespeicherte Entscheidung und lädt keinen Tracker', () => {
    CookieConsent.init()
    expect(document.getElementById('cookie-banner')).not.toHaveClass('hidden')
    expect(document.getElementById('owa-tracker')).toBeNull()
  })

  it('Akzeptieren speichert Consent, versteckt das Banner und lädt den gebündelten Tracker', () => {
    CookieConsent.init()
    document.getElementById('cookie-accept').click()

    expect(CookieConsent.analyticsAllowed()).toBe(true)
    expect(document.getElementById('cookie-banner')).toHaveClass('hidden')
    const tracker = document.getElementById('owa-tracker')
    expect(tracker).not.toBeNull()
    // Kein Fremd-Origin im script-src: der Tracker kommt aus dem eigenen Bundle.
    expect(tracker.getAttribute('src')).not.toMatch(/^https?:\/\//)
    expect(window.owa_baseUrl).toBe('https://analytics.malura.de/')
    expect(window.owa_cmds.some((c) => c[0] === 'trackPageView')).toBe(true)
  })

  it('Ablehnen speichert die Ablehnung und lädt nichts', () => {
    CookieConsent.init()
    document.getElementById('cookie-reject').click()

    expect(CookieConsent.hasConsent()).toBe(true)
    expect(CookieConsent.analyticsAllowed()).toBe(false)
    expect(document.getElementById('cookie-banner')).toHaveClass('hidden')
    expect(document.getElementById('owa-tracker')).toBeNull()
  })

  it('lädt den Tracker nicht doppelt', () => {
    CookieConsent.setConsent(true)
    CookieConsent.loadAnalytics()
    CookieConsent.loadAnalytics()
    expect(document.querySelectorAll('#owa-tracker')).toHaveLength(1)
  })
})
