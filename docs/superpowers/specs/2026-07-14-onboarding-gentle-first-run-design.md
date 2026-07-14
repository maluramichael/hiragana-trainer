# Onboarding: Sanfter Erststart — Design

Datum: 2026-07-14
Scope: Booster-Tickets #2, #51, #32 (Cluster „Onboarding"). Nicht enthalten: #33 (Quiz-Preview im Hero), #34 (Tagesziel), #10 (Returner-Smart-CTA) — bleiben eigene Tickets.

## Problem

Erstnutzer werden auf nie gelernte Zeichen gequizt: Landing-CTA und Quickstart springen direkt ins Quiz auf die Hiragana-Vokale, obwohl der StudyMode/Flashcard-Modus schon existiert. Die erste Runde ist garantiert falsch („Not quite"-Wand). Ironie: der Landing-CTA heißt bereits **„Lerne die Vokale"**, testet aber statt zu lehren. Zusätzlich: der Voll-Picker überfordert Anfänger (15 Serien-Rows auf einmal), und es fehlt jeder Ein-Satz-Kontext, was Kana/Romaji überhaupt sind.

## Zielbild

Ein Erstnutzer (keine Statistik) wird sanft geführt: erst die 5 Vokale als Flashcards sehen, dann darauf quizzen. Der Picker zeigt Anfängern nur das Nötige. Ein Satz erklärt, was Kana sind.

## Erstnutzer-Erkennung

`getOverallStatistics().practicedKana === 0` → „first run". Frisch zum Klick-/Render-Zeitpunkt gelesen, kein neuer persistenter State. KanaSelection hat dieses Flag bereits als `hasData`.

## #2 — Erst lernen, dann quizzen

- **Landing-CTA „Lerne die Vokale"** (`App.jsx` `handleStartFromLanding`, auch Nav-„Loslegen" → selbes `onStart`):
  - first run → `handleStartStudy(kanaGroups.basic.vowels.hiragana, { scriptMode: 'hiragana' })` (StudyMode).
  - sonst → wie heute direkt Quiz auf die Vokale.
- **Quickstart in `KanaSelection`** (`handleQuickstart`, nur bei `!hasData` sichtbar): `onStartQuiz` → `onStudy` mit dem Vokal-Set.
- **Übergang Study → Quiz:** StudyMode hat bereits „Jetzt Quiz starten" (`onStartQuiz` → `handleStudyStartQuiz`), das auf dem gleichen Set quizzt. Kein neuer Modus, keine Änderung an StudyMode nötig.
- **Kein Zwang:** In StudyMode bleiben Weiter/Zurück und „Zurück zur Auswahl" erhalten; „Jetzt Quiz starten" ist der klare nächste Schritt.

Ergebnis: das Label „Lerne die Vokale" wird ehrlich.

## #51 — Picker-Accordion für Anfänger

- Die 3 Gruppen (`basic`, `dakuten`, `handakuten`) werden einklappbar: Header wird ein Toggle (Gruppenname + „Empfohlen"-Badge + Mastery-Meter + Chevron), Inhalt (Sub-Serien-Rows) ein-/ausklappbar.
- Collapse-State pro Gruppe als lokaler `useState`, initialisiert aus `hasData`:
  - **first run:** `basic` offen (Vokal-Serie mit „Empfohlen"-Badge sichtbar), `dakuten` + `handakuten` zu.
  - **Wiederkehrer (`hasData`):** alle offen — Verhalten wie heute.
- Toggle-Header ist ein `<button>` mit `aria-expanded`; eingeklappter Inhalt wird nicht gerendert (bzw. `hidden`), damit Screenreader/Tab-Reihenfolge sauber bleiben.
- Auswahl-Logik (`selectedGroups`, `getKanaForSelection`, Meter) bleibt unverändert — nur die Sichtbarkeit der Rows ändert sich.

## #32 — Was-ist-Kana-Kontext

- **Landing:** die vorhandenen ひらがな/カタカナ-Chip-Reihen bekommen je ein Mini-Label „Hiragana" / „Katakana" darunter (aktuell rein dekorativ, `aria-hidden`). Neue i18n-Keys `landing.hero.scriptHiragana` / `scriptKatakana`.
- **Ein-Satz-Erklärung** unter dem Hero-Subtitle (neuer Key `landing.hero.kanaExplainer`), z. B. „Kana sind die zwei japanischen Silbenschriften. Fang mit Hiragana an." (du-Ansprache, kein Em-Dash).
- **Frühe Tofugu-Links:** ein dezenter „Neu bei Kana? Grundlagen lesen"-Link auf Landing **und** KanaSelection (nur first run), der auf die Tofugu-Hiragana-Seite zeigt (die URLs existieren schon in `QuizResults.jsx`; die zwei Konstanten in ein kleines gemeinsames Modul `src/data/links.js` heben, damit Landing/Selection/Results dieselbe Quelle nutzen — DRY).

## Betroffene Dateien

- `src/App.jsx` — `handleStartFromLanding` verzweigt nach first run.
- `src/components/KanaSelection.jsx` — `handleQuickstart` → Study; Gruppen-Accordion; first-run-Explainer-Link.
- `src/components/LandingPage.jsx` — Chip-Labels, Kana-Explainer-Zeile, Tofugu-Link.
- `src/data/links.js` (neu) — Tofugu-URL-Konstanten (aus QuizResults extrahiert).
- `src/components/QuizResults.jsx` — nutzt die extrahierten Link-Konstanten (kein Verhaltensänderung).
- `src/i18n/locales/de.json`, `en.json` — neue Keys (scriptHiragana/Katakana, kanaExplainer, basicsLink).

## Tests

- **Unit (Vitest):**
  - `handleStartFromLanding`: first run → Study-View; mit vorhandener Statistik → Quiz-View. (App.test)
  - KanaSelection: Quickstart bei `!hasData` ruft `onStudy` (nicht `onStartQuiz`).
  - KanaSelection: Accordion-Default — `dakuten`/`handakuten`-Inhalt bei first run nicht im DOM; bei `hasData` sichtbar; `aria-expanded` korrekt.
  - Landing: Explainer + Chip-Labels + Tofugu-Link rendern.
- **Playwright (Live-/Preview-Smoke):** Erstlauf Landing → „Lerne die Vokale" → StudyMode → „Jetzt Quiz starten" → Quiz auf denselben Vokalen. Danach (mit Statistik) überspringt der CTA Study und geht direkt ins Quiz.

## Erfolgskriterien

- Ein Erstnutzer sieht als Erstes lernbare Vokale (Romaji sichtbar), nicht die Not-quite-Wand.
- Der Picker zeigt Anfängern höchstens die Grundserie offen.
- Auf Landing/Selection steht ein Satz, was Kana sind, plus ein Grundlagen-Link.
- Wiederkehrer erleben keine Regression (direkter Quiz-Einstieg, voller Picker).
- Lint + Tests grün; Erstlauf-Flow per Playwright verifiziert.
