# Hiragana Trainer 🇯🇵

A free web app for learning the two Japanese kana syllabaries, Hiragana and Katakana.
You see a character, type its reading, and get instant feedback. Progress stays on your
device. No signup, no ads.

Live at [hiragana-trainer.de](https://hiragana-trainer.de).

## Features

**Practice that fits how you learn**
- Pick whole groups (basic, dakuten, handakuten) or single series (vowels, k-series, and so on)
- Drill Hiragana only, Katakana only, or both together
- Study characters as flashcards first, then start the quiz
- One click starts a round on the five vowels, so the first visit is productive right away

**Type the reading, get feedback**
- Each character is shown on its own; you type the romaji and submit
- Correct and incorrect answers are marked immediately
- Characters you get wrong come back at the end of the round until they stick

**Progress you can see**
- Per character: accuracy, number of attempts, and average response time
- Weak characters and characters due for review can be practised in a focused round
- A daily streak and your best answer streak
- Export or import your progress with a short code to move between devices

**Yours, and only yours**
- Everything is stored locally in your browser, nothing leaves your device
- Installable as a PWA and works offline
- Available in German and English

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm

### Installation

```bash
git clone git@github.com:maluramichael/hiragana-trainer.git
cd hiragana-trainer
npm install
npm run dev
```

Then open `http://localhost:5173`.

### Building for Production

```bash
npm run build
```

The built files land in the `dist` directory.

### Tests and Linting

```bash
npm run test:run   # run the test suite once
npm run lint       # lint the codebase
```

## How to Use

1. Start for free on the landing page, or pick the characters you want yourself
2. Choose your groups and whether to drill Hiragana, Katakana, or both
3. Optionally study the characters as flashcards first
4. For each character shown, type the romaji and submit
5. Check your statistics to see accuracy and response time per character

## Technology Stack

- **Frontend**: React 19 with Vite
- **Styling**: Tailwind CSS 4
- **Internationalization**: react-i18next
- **Testing**: Vitest with Testing Library
- **PWA**: manifest and service worker for offline use

## Contributing

Contributions are welcome. Feel free to open an issue or a pull request.

## License

Open source under the MIT License.
