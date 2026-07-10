# Backlog

Punkte, die bewusst NICHT als Code umgesetzt wurden, weil sie reine Strategie sind oder eine
externe Abhängigkeit (Konto, Partner-ID, Backend) brauchen. Der Code-Anteil ist jeweils
umgesetzt; hier steht nur der offene Rest.

## Reine Strategie (kein Code)

### #25 Positionierung / Differenzierung gegen Real Kana, Tofugu, Kana Pro
Positioning-Übung (April Dunford): Competitive Alternative benennen, Unique Value herausarbeiten
("sieht pro Zeichen deine Reaktionszeit und Trefferquote, kostenlos, ohne Anmeldung"). Ergebnis fließt
in Landingpage-Copy und Meta-Beschreibungen. Entscheidung/Wording liegt beim Betreiber.

### #58 Distributionskanäle (Bullseye)
Konkrete erste Schritte, alles außerhalb des Codes:
1. In "awesome-japanese-learning"-GitHub-Listen per PR eintragen.
2. Ein nutzwertiger Post in r/LearnJapanese (kein Spam, echter Mehrwert).
3. Eintrag in Tool-Verzeichnisse (siehe auch directory-submissions).
Reichweite ist bei einem fertigen Free-Tool der Engpass, nicht das Produkt.

### #77 Cross-Device-Sync als Premium/Retention (Geschäftsmodell)
Der manuelle Base64-Sync ist umgesetzt und sichtbar. Der Business-Teil (echter Account-basierter Sync
als Premium-Haken) braucht ein Backend und eine Produktentscheidung. Bewusst offen.

### #41 Premium-Content-Moat (Business-Teil)
Kana bleibt gratis (Top-of-Funnel). Ein optionales Premium-Deck (JLPT-N5-Vokabular oder Grund-Kanji)
als einmaliger Kauf ist ein Geschäftsmodell, kein reines Code-Ticket. Der Code-/Integrationsrahmen ist
vorbereitet; die Inhalte, Preisgestaltung und der echte Zahlungsanbieter kommen vom Betreiber.

## Größere Umbauten (bewusst zurückgestellt)

### #75 Programmatic SEO (React Router + Prerender)
Echte indexierbare Routen pro Kana-Serie (z.B. `/hiragana/k-reihe`) mit eigenem Title/H1/Meta
brauchen React Router UND ein Prerender-/SSG-Tooling (neue Dependencies) sowie einen Umbau der
Navigation von der aktuellen `currentView`-State-Machine auf Routen. Das ist ein größerer,
risikoreicher Umbau der aktuell stabilen App. Zurückgestellt. Der Crawler-Basisnutzen ist über das
statische Above-the-Fold-Markup (#13), robots.txt, sitemap.xml und JSON-LD bereits abgedeckt.

### #41 Premium-Deck + echte Bezahlung
Premium-Deck (JLPT-N5-Vokabular / Grund-Kanji) als einmaliger Kauf braucht Inhalte, eine
Produktentscheidung und einen echten Zahlungsanbieter-Account (Stripe Payment Link / Gumroad / Ko-fi),
den nur der Betreiber anlegen kann. Zurückgestellt, bis Konto und Inhalte stehen.

## Externe Abhängigkeiten (Code teils vorbereitet, Rest braucht Konto/ID)

- **#41 echtes Payment:** Integration gegen einen hosted Checkout-Link (Stripe Payment Link / Gumroad /
  Ko-fi) vorgesehen. Braucht ein echtes Konto + Produkt. Ohne das bleibt es Platzhalter.
- **#26 Ko-fi / Buy-me-a-coffee:** Es wurden nur echte Links gesetzt (GitHub Star, GitHub Sponsors auf
  `maluramichael`). Ein Ko-fi/BMAC-Kanal braucht ein echtes Handle, sonst kein Link.
- **#93 Affiliate:** Es stehen saubere, normale Links (Tofugu). Affiliate-Monetarisierung braucht echte
  Partner-IDs (Amazon PartnerNet für Genki, WaniKani-Referral); erst dann Tracking-Parameter ergänzen.
- **#31 SRI auf Analytics-Script:** Echte Subresource Integrity braucht einen fixen Hash der
  selbst-gehosteten OWA-Datei. Da sich die Datei bei OWA-Updates ändert, würde ein Hash still brechen.
  Aktuell nur `crossorigin` gesetzt. Sauber lösbar, wenn die OWA-Version eingefroren/gepinnt wird.
- **#81 Inline-Consent-Script auslagern:** Die CSP nutzt aktuell `script-src 'unsafe-inline'`, weil der
  GDPR-Consent-Loader inline in `index.html` liegt (samt inline `onclick`). Auslagern in eine gebündelte
  JS-Datei (Event-Listener statt inline onclick) erlaubt `script-src 'self'` ohne `unsafe-inline`.
  Berührt die DSGVO-Mechanik, daher bewusst separat.
- **#24 OG-Image als PNG:** Aktuell `og-image.svg`. Manche Plattformen rendern SVG-OG-Images schlecht;
  ein 1200x630-PNG-Export wird empfohlen.
- **#37 Delta zur letzten Session:** Der "nächster Schritt"-CTA ist da; der Vergleich "+4% vs. letzte
  Runde" braucht eine persistierte Session-Historie (kleine Erweiterung der Datenschicht).
- **#8 Reengagement per Push/Mail:** Die PWA-/Installierbarkeit ist umgesetzt. Echte Web-Push- oder
  Mail-Reaktivierung braucht ein Backend und liegt außerhalb der serverlosen Architektur.
