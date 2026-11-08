// #81 / #17 / #29: Cookie-Consent und Analytics-Loader als gebündeltes Modul statt
// Inline-Script in index.html. Damit kommt die CSP ohne 'unsafe-inline' im script-src
// aus. Der OWA-Tracker wird nicht mehr von analytics.malura.de geladen, sondern als
// gepinnte Kopie (src/vendor/owa.tracker.js) mit Hash im Dateinamen aus dem eigenen
// Origin. analytics.malura.de bleibt nur für die Beacons (connect-src/img-src).
import owaTrackerUrl from '../vendor/owa.tracker.js?url'

const STORAGE_KEY = 'cookie_consent'
const OWA_BASE_URL = 'https://analytics.malura.de/'
const OWA_SITE_ID = '82e604404dc994a836060d390e428c89'

export const CookieConsent = {
  STORAGE_KEY,
  getConsent() {
    try {
      const consent = localStorage.getItem(STORAGE_KEY)
      return consent ? JSON.parse(consent) : null
    } catch {
      return null
    }
  },
  setConsent(accepted) {
    const consent = { analytics: accepted, timestamp: new Date().toISOString(), version: 1 }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent))
    return consent
  },
  hasConsent() {
    return this.getConsent() !== null
  },
  analyticsAllowed() {
    const consent = this.getConsent()
    return !!consent && consent.analytics === true
  },
  showBanner() {
    if (this.hasConsent()) return
    document.getElementById('cookie-banner')?.classList.remove('hidden')
  },
  hideBanner() {
    document.getElementById('cookie-banner')?.classList.add('hidden')
  },
  accept() {
    this.setConsent(true)
    this.hideBanner()
    this.loadAnalytics()
  },
  reject() {
    this.setConsent(false)
    this.hideBanner()
  },
  loadAnalytics() {
    if (!this.analyticsAllowed()) return
    if (document.getElementById('owa-tracker')) return
    window.owa_baseUrl = OWA_BASE_URL
    window.owa_cmds = window.owa_cmds || []
    window.owa_cmds.push(['setSiteId', OWA_SITE_ID])
    window.owa_cmds.push(['trackPageView'])
    window.owa_cmds.push(['trackClicks'])
    const script = document.createElement('script')
    script.id = 'owa-tracker'
    script.async = true
    script.src = owaTrackerUrl
    document.head.appendChild(script)
  },
  init() {
    const start = () => {
      document.getElementById('cookie-accept')?.addEventListener('click', () => this.accept())
      document.getElementById('cookie-reject')?.addEventListener('click', () => this.reject())
      if (this.analyticsAllowed()) {
        this.loadAnalytics()
      } else if (!this.hasConsent()) {
        this.showBanner()
      }
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start, { once: true })
    } else {
      start()
    }
  },
}

// #61: auf window legen, damit trackEvent() in analytics.js
// (window.CookieConsent?.analyticsAllowed?.()) den Consent-Stand sieht.
window.CookieConsent = CookieConsent
