import { useMemo } from 'react';
import { hiragana, katakana } from '../data/kana.js';

// Purely decorative layer of faint, slowly floating kana behind a screen's
// content. aria-hidden and pointer-events-none so it never touches semantics,
// accessibility, or interaction. The float animation is neutralised under
// prefers-reduced-motion by the global rule in index.css.

// Every real kana is a candidate, so the backdrop varies from visit to visit
// instead of always showing the same six characters.
const POOL = [...hiragana, ...katakana].map((k) => k.kana);

const SPOTS = [
  { className: 'left-[6%] top-[14%] text-8xl', delay: '0s' },
  { className: 'right-[8%] top-[20%] text-7xl', delay: '1.2s' },
  { className: 'left-[12%] bottom-[16%] text-7xl', delay: '2.1s' },
  { className: 'right-[14%] bottom-[12%] text-8xl', delay: '0.6s' },
  { className: 'left-[46%] top-[8%] text-6xl', delay: '1.8s' },
  { className: 'right-[38%] bottom-[8%] text-6xl', delay: '2.6s' },
];

// Pick n distinct random characters from the pool.
const pickRandom = (n) => {
  const copy = [...POOL];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
};

const KanaBackground = () => {
  // One random set per mount; navigating between screens re-rolls it.
  const chars = useMemo(() => pickRandom(SPOTS.length), []);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      {SPOTS.map((spot, i) => (
        <span
          key={i}
          style={{ animationDelay: spot.delay }}
          className={`font-kana animate-float absolute font-bold text-fuchsia-400/15 ${spot.className}`}
        >
          {chars[i]}
        </span>
      ))}
    </div>
  );
};

export default KanaBackground;
