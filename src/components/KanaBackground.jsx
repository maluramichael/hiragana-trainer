// Purely decorative layer of faint, slowly floating kana behind a screen's
// content. aria-hidden and pointer-events-none so it never touches semantics,
// accessibility, or interaction. The float animation is neutralised under
// prefers-reduced-motion by the global rule in index.css.
const BLOBS = [
  { ch: 'あ', className: 'left-[6%] top-[14%] text-8xl', delay: '0s' },
  { ch: 'ア', className: 'right-[8%] top-[20%] text-7xl', delay: '1.2s' },
  { ch: 'き', className: 'left-[12%] bottom-[16%] text-7xl', delay: '2.1s' },
  { ch: 'ヌ', className: 'right-[14%] bottom-[12%] text-8xl', delay: '0.6s' },
  { ch: 'さ', className: 'left-[46%] top-[8%] text-6xl', delay: '1.8s' },
  { ch: 'ん', className: 'right-[38%] bottom-[8%] text-6xl', delay: '2.6s' },
];

const KanaBackground = () => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden select-none">
    {BLOBS.map(({ ch, className, delay }) => (
      <span
        key={ch}
        style={{ animationDelay: delay }}
        className={`font-kana animate-float absolute font-bold text-fuchsia-400/15 ${className}`}
      >
        {ch}
      </span>
    ))}
  </div>
);

export default KanaBackground;
