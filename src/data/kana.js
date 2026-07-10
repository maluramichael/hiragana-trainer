const hiraganaBase = [
  { kana: 'あ', romaji: 'a' },
  { kana: 'い', romaji: 'i' },
  { kana: 'う', romaji: 'u' },
  { kana: 'え', romaji: 'e' },
  { kana: 'お', romaji: 'o' },
  { kana: 'か', romaji: 'ka' },
  { kana: 'き', romaji: 'ki' },
  { kana: 'く', romaji: 'ku' },
  { kana: 'け', romaji: 'ke' },
  { kana: 'こ', romaji: 'ko' },
  { kana: 'が', romaji: 'ga' },
  { kana: 'ぎ', romaji: 'gi' },
  { kana: 'ぐ', romaji: 'gu' },
  { kana: 'げ', romaji: 'ge' },
  { kana: 'ご', romaji: 'go' },
  { kana: 'さ', romaji: 'sa' },
  { kana: 'し', romaji: 'shi' },
  { kana: 'す', romaji: 'su' },
  { kana: 'せ', romaji: 'se' },
  { kana: 'そ', romaji: 'so' },
  { kana: 'ざ', romaji: 'za' },
  { kana: 'じ', romaji: 'ji' },
  { kana: 'ず', romaji: 'zu' },
  { kana: 'ぜ', romaji: 'ze' },
  { kana: 'ぞ', romaji: 'zo' },
  { kana: 'た', romaji: 'ta' },
  { kana: 'ち', romaji: 'chi' },
  { kana: 'つ', romaji: 'tsu' },
  { kana: 'て', romaji: 'te' },
  { kana: 'と', romaji: 'to' },
  { kana: 'だ', romaji: 'da' },
  { kana: 'ぢ', romaji: 'ji' },
  { kana: 'づ', romaji: 'zu' },
  { kana: 'で', romaji: 'de' },
  { kana: 'ど', romaji: 'do' },
  { kana: 'な', romaji: 'na' },
  { kana: 'に', romaji: 'ni' },
  { kana: 'ぬ', romaji: 'nu' },
  { kana: 'ね', romaji: 'ne' },
  { kana: 'の', romaji: 'no' },
  { kana: 'は', romaji: 'ha' },
  { kana: 'ひ', romaji: 'hi' },
  { kana: 'ふ', romaji: 'fu' },
  { kana: 'へ', romaji: 'he' },
  { kana: 'ほ', romaji: 'ho' },
  { kana: 'ば', romaji: 'ba' },
  { kana: 'び', romaji: 'bi' },
  { kana: 'ぶ', romaji: 'bu' },
  { kana: 'べ', romaji: 'be' },
  { kana: 'ぼ', romaji: 'bo' },
  { kana: 'ぱ', romaji: 'pa' },
  { kana: 'ぴ', romaji: 'pi' },
  { kana: 'ぷ', romaji: 'pu' },
  { kana: 'ぺ', romaji: 'pe' },
  { kana: 'ぽ', romaji: 'po' },
  { kana: 'ま', romaji: 'ma' },
  { kana: 'み', romaji: 'mi' },
  { kana: 'む', romaji: 'mu' },
  { kana: 'め', romaji: 'me' },
  { kana: 'も', romaji: 'mo' },
  { kana: 'や', romaji: 'ya' },
  { kana: 'ゆ', romaji: 'yu' },
  { kana: 'よ', romaji: 'yo' },
  { kana: 'ら', romaji: 'ra' },
  { kana: 'り', romaji: 'ri' },
  { kana: 'る', romaji: 'ru' },
  { kana: 'れ', romaji: 're' },
  { kana: 'ろ', romaji: 'ro' },
  { kana: 'わ', romaji: 'wa' },
  { kana: 'を', romaji: 'wo' },
  { kana: 'ん', romaji: 'n' }
];

const katakanaBase = [
  { kana: 'ア', romaji: 'a' },
  { kana: 'イ', romaji: 'i' },
  { kana: 'ウ', romaji: 'u' },
  { kana: 'エ', romaji: 'e' },
  { kana: 'オ', romaji: 'o' },
  { kana: 'カ', romaji: 'ka' },
  { kana: 'キ', romaji: 'ki' },
  { kana: 'ク', romaji: 'ku' },
  { kana: 'ケ', romaji: 'ke' },
  { kana: 'コ', romaji: 'ko' },
  { kana: 'ガ', romaji: 'ga' },
  { kana: 'ギ', romaji: 'gi' },
  { kana: 'グ', romaji: 'gu' },
  { kana: 'ゲ', romaji: 'ge' },
  { kana: 'ゴ', romaji: 'go' },
  { kana: 'サ', romaji: 'sa' },
  { kana: 'シ', romaji: 'shi' },
  { kana: 'ス', romaji: 'su' },
  { kana: 'セ', romaji: 'se' },
  { kana: 'ソ', romaji: 'so' },
  { kana: 'ザ', romaji: 'za' },
  { kana: 'ジ', romaji: 'ji' },
  { kana: 'ズ', romaji: 'zu' },
  { kana: 'ゼ', romaji: 'ze' },
  { kana: 'ゾ', romaji: 'zo' },
  { kana: 'タ', romaji: 'ta' },
  { kana: 'チ', romaji: 'chi' },
  { kana: 'ツ', romaji: 'tsu' },
  { kana: 'テ', romaji: 'te' },
  { kana: 'ト', romaji: 'to' },
  { kana: 'ダ', romaji: 'da' },
  { kana: 'ヂ', romaji: 'ji' },
  { kana: 'ヅ', romaji: 'zu' },
  { kana: 'デ', romaji: 'de' },
  { kana: 'ド', romaji: 'do' },
  { kana: 'ナ', romaji: 'na' },
  { kana: 'ニ', romaji: 'ni' },
  { kana: 'ヌ', romaji: 'nu' },
  { kana: 'ネ', romaji: 'ne' },
  { kana: 'ノ', romaji: 'no' },
  { kana: 'ハ', romaji: 'ha' },
  { kana: 'ヒ', romaji: 'hi' },
  { kana: 'フ', romaji: 'fu' },
  { kana: 'ヘ', romaji: 'he' },
  { kana: 'ホ', romaji: 'ho' },
  { kana: 'バ', romaji: 'ba' },
  { kana: 'ビ', romaji: 'bi' },
  { kana: 'ブ', romaji: 'bu' },
  { kana: 'ベ', romaji: 'be' },
  { kana: 'ボ', romaji: 'bo' },
  { kana: 'パ', romaji: 'pa' },
  { kana: 'ピ', romaji: 'pi' },
  { kana: 'プ', romaji: 'pu' },
  { kana: 'ペ', romaji: 'pe' },
  { kana: 'ポ', romaji: 'po' },
  { kana: 'マ', romaji: 'ma' },
  { kana: 'ミ', romaji: 'mi' },
  { kana: 'ム', romaji: 'mu' },
  { kana: 'メ', romaji: 'me' },
  { kana: 'モ', romaji: 'mo' },
  { kana: 'ヤ', romaji: 'ya' },
  { kana: 'ユ', romaji: 'yu' },
  { kana: 'ヨ', romaji: 'yo' },
  { kana: 'ラ', romaji: 'ra' },
  { kana: 'リ', romaji: 'ri' },
  { kana: 'ル', romaji: 'ru' },
  { kana: 'レ', romaji: 're' },
  { kana: 'ロ', romaji: 'ro' },
  { kana: 'ワ', romaji: 'wa' },
  { kana: 'ヲ', romaji: 'wo' },
  { kana: 'ン', romaji: 'n' }
];

// Serien-Layout in Array-Reihenfolge: benennt jede Kana-Serie und ihren Typ
// genau einmal. hiragana und katakana sind index-aligned, teilen sich also
// dasselbe Layout. Ersetzt die früheren hartkodierten slice-Indizes (#99).
const seriesLayout = [
  { type: 'basic', series: 'vowels', count: 5 },
  { type: 'basic', series: 'k', count: 5 },
  { type: 'dakuten', series: 'g', count: 5 },
  { type: 'basic', series: 's', count: 5 },
  { type: 'dakuten', series: 'z', count: 5 },
  { type: 'basic', series: 't', count: 5 },
  { type: 'dakuten', series: 'd', count: 5 },
  { type: 'basic', series: 'n', count: 5 },
  { type: 'basic', series: 'h', count: 5 },
  { type: 'dakuten', series: 'b', count: 5 },
  { type: 'handakuten', series: 'p', count: 5 },
  { type: 'basic', series: 'm', count: 5 },
  { type: 'basic', series: 'y', count: 3 },
  { type: 'basic', series: 'r', count: 5 },
  { type: 'basic', series: 'w', count: 3 }
];

// Layout auf eine flache Zuordnung pro Index expandieren, dann series/type
// an jedes Kana-Objekt hängen (Consumer lesen weiterhin nur .kana/.romaji).
const flatLayout = seriesLayout.flatMap(({ type, series, count }) =>
  Array.from({ length: count }, () => ({ type, series }))
);

if (flatLayout.length !== hiraganaBase.length || flatLayout.length !== katakanaBase.length) {
  throw new Error('kana seriesLayout deckt nicht alle Zeichen ab');
}

const withLayout = (base) => base.map((k, i) => ({ ...k, ...flatLayout[i] }));

export const hiragana = withLayout(hiraganaBase);
export const katakana = withLayout(katakanaBase);

// Anzeige-Reihenfolge der Gruppen (bewusst NICHT die Array-Reihenfolge): legt
// die Key-Reihenfolge des exportierten kanaGroups fest.
const groupOrder = {
  basic: ['vowels', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w'],
  dakuten: ['g', 'z', 'd', 'b'],
  handakuten: ['p']
};

// kanaGroups aus den series/type-Eigenschaften ableiten statt aus slice-Indizes.
// filter erhält die Array-Reihenfolge, daher bleibt die Zeichenfolge je Gruppe
// identisch zur früheren Hand-Definition.
export const kanaGroups = Object.fromEntries(
  Object.entries(groupOrder).map(([type, seriesList]) => [
    type,
    Object.fromEntries(seriesList.map((series) => [
      series,
      {
        hiragana: hiragana.filter((k) => k.type === type && k.series === series),
        katakana: katakana.filter((k) => k.type === type && k.series === series)
      }
    ]))
  ])
);

// Liefert das positionsgleiche Gegenstück im anderen Script (Hiragana ↔ Katakana)
// per Identität/Index, NICHT per romaji — sonst kollidieren doppelte romaji wie
// 'ji' (じ/ぢ) und 'zu' (ず/づ) (#11). Gibt null zurück, wenn kanaObj unbekannt ist.
export function getScriptCounterpart(kanaObj) {
  // Über den eindeutigen Kana-String suchen (robust gegen geklonte/serialisierte
  // Objekte), Gegenstück positionsgleich im anderen Script zurückgeben.
  if (!kanaObj || !kanaObj.kana) return null;
  const hi = hiragana.findIndex((k) => k.kana === kanaObj.kana);
  if (hi !== -1) return katakana[hi] ?? null;
  const ka = katakana.findIndex((k) => k.kana === kanaObj.kana);
  if (ka !== -1) return hiragana[ka] ?? null;
  return null;
}
