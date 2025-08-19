# Kana Quiz 🇯🇵

A modern, interactive web application for learning Japanese Hiragana and Katakana characters. Master the foundation of Japanese writing through engaging quizzes and track your progress along the way.

## Features

**🎯 Interactive Learning**
- Choose from basic kana, dakuten, and handakuten character groups
- Practice individual series (vowels, k-series, s-series, etc.) or mix them up
- Real-time feedback with correct/incorrect responses

**📊 Progress Tracking**
- Detailed statistics for each character including accuracy rates
- Track response times and identify characters that need more practice
- Visual progress indicators showing mastery levels
- Export your statistics for external analysis

**🌐 Multilingual Support**
- Available in German and English
- Localized date formatting and interface elements
- Easy language switching

**🎨 Beautiful Design**
- Clean, modern interface built with React and Tailwind CSS
- Responsive design that works on desktop and mobile
- Smooth animations and intuitive user experience

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone git@github.com:maluramichael/hiragana-trainer.git
cd kana
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be available in the `dist` directory.

## How to Use

1. **Select Characters**: Choose which kana groups you want to practice from the main screen
2. **Start Quiz**: Click the start button to begin your practice session
3. **Type Romaji**: For each kana character shown, type the corresponding romaji
4. **Track Progress**: View detailed statistics to see your improvement over time
5. **Export Data**: Download your progress data for further analysis

## Technology Stack

- **Frontend**: React 19 with Vite
- **Styling**: Tailwind CSS 4
- **Internationalization**: react-i18next
- **Language Detection**: i18next-browser-languagedetector
- **Build Tool**: Vite with fast refresh

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to help improve the application.

## License

This project is open source and available under the MIT License.