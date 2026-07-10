import { useTranslation } from 'react-i18next';

// The three feature cards, each tagged with a decorative kana. Copy lives in
// i18n under landing.features.<key>; the mark is purely visual.
const FEATURES = [
  { key: 'accuracy', mark: 'あ' },
  { key: 'repeat', mark: 'カ' },
  { key: 'offline', mark: 'ぬ' }
];

// First screen of the app. The primary CTA jumps straight into a quiz (the
// caller wires it to the hiragana vowels); the secondary link opens the full
// character picker.
const LandingPage = ({ onStart, onChooseCharacters }) => {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50 text-slate-800 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
      <div className="max-w-3xl mx-auto px-6 py-20 sm:py-28">
        <section className="text-center">
          {/* Decorative kana motif, announced to nobody. */}
          <div
            aria-hidden="true"
            className="pointer-events-none select-none mb-8 flex justify-center gap-5 text-7xl sm:text-8xl font-light text-indigo-300/70 dark:text-indigo-400/30"
          >
            <span>あ</span>
            <span>ア</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('landing.hero.title')}
          </h1>

          <p className="mt-5 text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            {t('landing.hero.subtitle')}
          </p>

          <div className="mt-10 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={onStart}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:focus-visible:outline-indigo-400"
            >
              {t('landing.hero.cta')}
            </button>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('landing.hero.ctaHint')}
            </p>
            <button
              type="button"
              onClick={onChooseCharacters}
              className="mt-1 rounded text-sm font-medium text-indigo-700 underline underline-offset-4 hover:text-indigo-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
            >
              {t('landing.hero.secondary')}
            </button>
          </div>

          <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
            {t('landing.hero.trust')}
          </p>
        </section>

        <section aria-labelledby="landing-features" className="mt-20 sm:mt-28">
          <h2 id="landing-features" className="sr-only">
            {t('landing.features.heading')}
          </h2>
          <ul className="grid gap-6 sm:grid-cols-3">
            {FEATURES.map(({ key, mark }) => (
              <li
                key={key}
                className="rounded-2xl border border-slate-200 bg-white/70 p-6 dark:border-slate-800 dark:bg-slate-900/60"
              >
                <div
                  aria-hidden="true"
                  className="text-3xl font-light text-indigo-500 dark:text-indigo-400"
                >
                  {mark}
                </div>
                <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">
                  {t(`landing.features.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {t(`landing.features.${key}.body`)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
};

export default LandingPage;
