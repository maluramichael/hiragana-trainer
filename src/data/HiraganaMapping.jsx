export const HiraganaMapping = [
    {
        'name':     'a',
        'romanji':  ['a', 'i', 'u', 'e', 'o'],
        'hiragana': ['あ', 'い', 'う', 'え', 'お'],
    },
    {
        'name':     'ka',
        'romanji':  ['ka', 'ki', 'ku', 'ke', 'ko'],
        'hiragana': ['か', 'き', 'く', 'け', 'こ'],
    },
    {
        'name':     'sa',
        'romanji':  ['sa', 'shi', 'su', 'se', 'so'],
        'hiragana': ['さ', 'し', 'す', 'せ', 'そ'],
    },
    {
        'name':     'ta',
        'romanji':  ['ta', 'chi', 'tsu', 'te', 'to'],
        'hiragana': ['た', 'ち', 'つ', 'て', 'と'],
    },
    {
        'name':     'na',
        'romanji':  ['na', 'ni', 'nu', 'ne', 'no'],
        'hiragana': ['な', 'に', 'ぬ', 'ね', 'の'],
    },
    {
        'name':     'ha',
        'romanji':  ['ha', 'hi', 'hu/fu', 'he', 'ho'],
        'hiragana': ['は', 'ひ', 'ふ', 'へ', 'ほ'],
    },
    {
        'name':     'ma',
        'romanji':  ['ma', 'mi', 'mu', 'me', 'mo'],
        'hiragana': ['ま', 'み', 'む', 'め', 'も'],
    },
    {
        'name':     'ya',
        'romanji':  ['ya', 'yu', 'yo'],
        'hiragana': ['や', 'ゆ', 'よ'],
    },
    {
        'name':     'ra',
        'romanji':  ['ra', 'ri', 'ru', 're', 'ro'],
        'hiragana': ['ら', 'り', 'る', 'れ', 'ろ'],
    },
    {
        'name':     'wa',
        'romanji':  ['wa', 'wo', 'n'],
        'hiragana': ['わ', 'を', 'ん'],
    },
];

export const getRandomCharacter = (selectedSets) => {
    const sets             = selectedSets.split(',');
    const characterSetName = sets[Math.floor(Math.random() * sets.length)];
    const characterSet     = HiraganaMapping.find((item) => item.name === characterSetName);
    const index            = Math.floor(Math.random() * characterSet.romanji.length);

    return {
        'romanji':          characterSet.romanji[index],
        'hiragana':         characterSet.hiragana[index],
        'availableRomanji': characterSet.romanji,
    };
};
