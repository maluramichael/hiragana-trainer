// #90: DSGVO-konformer, dünner Wrapper um die OWA-Command-Queue.
// Feuert NUR, wenn der Nutzer per Cookie-Banner ins Analytics eingewilligt hat
// UND die OWA-Queue existiert (Analytics wird erst nach Opt-in geladen, siehe
// index.html). Ohne Consent/Queue: stiller No-op, kein Fehler.
export function trackEvent(action, label) {
  if (
    typeof window === 'undefined' ||
    !window.CookieConsent?.analyticsAllowed?.() ||
    !Array.isArray(window.owa_cmds)
  ) {
    return;
  }

  // OWA-Signatur: ['trackAction', group, action, label]
  window.owa_cmds.push(['trackAction', 'kana', action, label]);
}
