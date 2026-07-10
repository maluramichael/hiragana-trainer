import { useTranslation } from 'react-i18next';
import KanaBackground from './KanaBackground.jsx';
import { RocketIcon, SparkleIcon, RepeatIcon, HeartIcon } from './icons.jsx';

// The hero spells out the two syllabaries as bobbing badges: "hiragana" and
// "katakana", both written in hiragana.
const HIRAGANA_WORD = ['ひ', 'ら', 'が', 'な'];
const KATAKANA_WORD = ['か', 'た', 'か', 'な'];

// The three feature cards, each with a soft colored badge, a decorative kana and
// a matching icon. Copy lives in i18n under landing.features.<key>.
const FEATURES = [
  { key: 'accuracy', mark: 'あ', Icon: SparkleIcon, tint: 'from-pink-400 to-fuchsia-500' },
  { key: 'repeat', mark: 'カ', Icon: RepeatIcon, tint: 'from-violet-400 to-indigo-500' },
  { key: 'offline', mark: 'ぬ', Icon: HeartIcon, tint: 'from-sky-400 to-cyan-500' },
];

// First screen of the app. The primary CTA jumps straight into a quiz (the
// caller wires it to the hiragana vowels); the secondary link opens the full
// character picker.
const LandingPage = ({ onStart, onChooseCharacters }) => {
  const { t } = useTranslation();

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-rose-50 via-fuchsia-50 to-indigo-100 text-slate-800">
      <KanaBackground />

      <div className="relative max-w-3xl mx-auto px-6 py-16 sm:py-24">
        <section className="text-center">
          {/* Decorative motif: the words hiragana / katakana as bobbing badges. */}
          <div aria-hidden="true" className="mb-10 flex flex-col items-center gap-3">
            <div className="flex gap-2 sm:gap-3">
              {HIRAGANA_WORD.map((ch, i) => (
                <span
                  key={i}
                  style={{ animationDelay: `${i * 0.12}s` }}
                  className="font-kana animate-bob grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-2xl bg-gradient-to-br from-pink-400 to-fuchsia-500 text-3xl sm:text-4xl font-bold text-white shadow-cute"
                >
                  {ch}
                </span>
              ))}
            </div>
            <div className="flex gap-2 sm:gap-3">
              {KATAKANA_WORD.map((ch, i) => (
                <span
                  key={i}
                  style={{ animationDelay: `${(i + 4) * 0.12}s` }}
                  className="font-kana animate-bob grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 text-3xl sm:text-4xl font-bold text-white shadow-cute"
                >
                  {ch}
                </span>
              ))}
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            {t('landing.hero.title')}
          </h1>

          <p className="mt-5 text-lg text-slate-600 max-w-xl mx-auto">
            {t('landing.hero.subtitle')}
          </p>

          <div className="mt-10 flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={onStart}
              className="group inline-flex items-center gap-2.5 rounded-[1.4rem] bg-gradient-to-r from-pink-500 to-fuchsia-600 px-9 py-4 text-lg font-bold text-white shadow-cute-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cute-lg active:translate-y-0.5"
            >
              <RocketIcon className="w-6 h-6 transition-transform duration-200 group-hover:-rotate-12" />
              {t('landing.hero.cta')}
            </button>
            <p className="text-sm text-slate-500">
              {t('landing.hero.ctaHint')}
            </p>
            <button
              type="button"
              onClick={onChooseCharacters}
              className="mt-1 rounded-full px-4 py-1.5 text-sm font-semibold text-fuchsia-700 transition-colors hover:bg-fuchsia-100"
            >
              {t('landing.hero.secondary')}
            </button>
          </div>

          <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-slate-500 shadow-sm ring-1 ring-white/60">
            {t('landing.hero.trust')}
          </p>
        </section>

        <section aria-labelledby="landing-features" className="mt-20 sm:mt-24">
          <h2 id="landing-features" className="sr-only">
            {t('landing.features.heading')}
          </h2>
          <ul className="grid gap-6 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <li
                key={feature.key}
                className="group rounded-[1.75rem] bg-white/80 p-6 shadow-cute ring-1 ring-white/70 backdrop-blur-sm transition-transform duration-200 hover:-translate-y-1"
              >
                <div className={`relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${feature.tint} text-white shadow-md`}>
                  <feature.Icon className="w-7 h-7" />
                  <span aria-hidden="true" className="font-kana absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-white text-sm font-bold text-slate-700 shadow">
                    {feature.mark}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  {t(`landing.features.${feature.key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {t(`landing.features.${feature.key}.body`)}
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
