# Booster-Implementierung — Design & Wellenplan

**Datum:** 2026-07-10
**Ziel:** Die 75 deduplizierten Findings aus dem Project-Booster-Report (`booster-report.html`)
systematisch umsetzen, jedes mit Tests, alles immer grün.

## Rahmenbedingungen (vom Nutzer festgelegt)

- **Alles bauen**, auch die zwei großen Architektur-Features (programmatic SEO, Premium-Deck).
- **Strategie-Tickets:** konkreten Code-Anteil umsetzen + testen; reine Strategie nach `BACKLOG.md`.
- **Ausführung:** 1 Worktree (`develop`), Wellen, pro Welle ≤4 Subagenten für *nicht überlappende*
  Dateien, Grün-Gate + Commit nach jeder Welle.
- **Branch-Strategie:** Entwicklung auf `develop` (kein Auto-Deploy). Merge nach `master` erst auf
  ausdrückliche Freigabe. Baseline-Commit `6333c8d` (base64 Cross-Device Import/Export) ist Grundlage.
- **Server/DokiDoki/Pipeline** wird nicht angefasst — nur Repo-Dateien (inkl. `nginx.conf`, `index.html`).
- Dev-Server läuft lokal (`npm run dev`, Port 5173) zum Reinschauen.

## Test-Strategie

- **Stack:** Vitest + @testing-library/react + @testing-library/jest-dom + jsdom + user-event.
- **Grün-Gate (nach jeder Welle):** `npm run lint && npm run test:run && npm run build` — muss grün sein,
  sonst kein Commit.
- Unit-Tests für Utils (statisticsManager, progressCalculator, kana-Helper), Component-Tests (RTL) für
  KanaQuiz/KanaSelection/Statistics/QuizResults. localStorage wird in Tests gemockt.
- Nicht-triviale Logik bekommt mindestens einen laufenden Test.

## Datei-Ownership-Modell

Parallelität läuft über **eine Datei pro Agent**. Nie zwei Agenten auf derselben Datei. Geteilte Dateien
(i18n-Locales `de.json`/`en.json`, `index.css`/`App.css`) werden bei der Integration **manuell** reconciled,
nicht von parallelen Agenten. Datenschicht landet vor den Komponenten, die sie konsumieren
(keine Interface-Races).

## Wellenplan

| Welle | Inhalt | Dateien (Owner je 1 Agent) |
|-------|--------|----------------------------|
| 0 | Test-Infra | vitest.config, setup, package.json scripts (selbst) |
| 1 | Datenschicht + Assets | `kana.js` · `statisticsManager.js` · `progressCalculator.js` · `index.html`+`public/*` |
| 2 | Quiz-Kern + Infra | `KanaQuiz.jsx` · `App.jsx` · `nginx.conf`+deps · `ProgressBar`+CSS |
| 3 | Komponenten | `Statistics.jsx` · `KanaSelection.jsx` · `QuizResults.jsx` · i18n-Reconcile (selbst) |
| 4 | Feature-Brocken (seriell) | Streak · Spaced Repetition/Lernmodus · PWA · Challenge-Link · Analytics-Events |
| 5 | Große Features | React Router + Prerender (programmatic SEO) · Premium-Deck + Checkout |
| 6 | Backlog + Spec | `BACKLOG.md` (reine Strategie), diese Spec |

## Ticket → Welle (Kurzform)

- **W1:** 11, 99, 100, 3, 28, 45, 83, 84, 53, 96, 24, 55, 56, 57, 76, 39, 13, 31, 38
- **W2:** 1, 79, 95, 29, 65, 64, 14, 15, 16, 68, 69, 80, 62, 30, 97, 49, 47, 85
- **W3:** 82, 48, 67, 50, 52, 87, 2, 18, 46, 70, 72, 61, 51, 6, 19, 32, 37, 10, 26, 78, 93
- **W4:** 7, 12, 9, 4, 8, 89, 22, 90
- **W5:** 75, 41
- **W6/Backlog:** 25, 58, 77, Business-Teil von 41

## Offene externe Abhängigkeiten

- **#41 echtes Payment:** braucht ein Konto/Produkt (Stripe Payment Link / Gumroad / Ko-fi). Integration
  wird gegen einen hosted Checkout-Link gebaut + Sample-Deck; die Kontoerstellung liegt beim Nutzer.
- **#58 Distribution / #25 Positioning:** externe Aktionen (PRs, Reddit-Posts, Messaging) → Backlog.
