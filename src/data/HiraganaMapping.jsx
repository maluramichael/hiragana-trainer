export const HiraganaRomanjiMap = {
    'あ': 'a',
    'い': 'i',
    'う': 'u',
    'え': 'e',
    'お': 'o',
    'か': 'ka',
    'き': 'ki',
    'く': 'ku',
    'け': 'ke',
    'こ': 'ko',
    'さ': 'sa',
    'し': 'shi',
    'す': 'su',
    'せ': 'se',
    'そ': 'so',
    'た': 'ta',
    'ち': 'chi',
    'つ': 'tsu',
    'て': 'te',
    'と': 'to',
    'な': 'na',
    'に': 'ni',
    'ぬ': 'nu',
    'ね': 'ne',
    'の': 'no',
    'は': 'ha',
    'ひ': 'hi',
    'ふ': ['hu', 'fu'],
    'へ': 'he',
    'ほ': 'ho',
    'ま': 'ma',
    'み': 'mi',
    'む': 'mu',
    'め': 'me',
    'も': 'mo',
    'や': 'ya',
    'ゆ': 'yu',
    'よ': 'yo',
    'ら': 'ra',
    'り': 'ri',
    'る': 'ru',
    'れ': 're',
    'ろ': 'ro',
    'わ': 'wa',
    'を': 'wo',
    'ん': ['nn', 'n'],
};

export const Sets = {
    'a': ['あ', 'い', 'う', 'え', 'お'],
    'ka': ['か', 'き', 'く', 'け', 'こ'],
    'sa': ['さ', 'し', 'す', 'せ', 'そ'],
    'ta': ['た', 'ち', 'つ', 'て', 'と'],
    'na': ['な', 'に', 'ぬ', 'ね', 'の'],
    'ha': ['は', 'ひ', 'ふ', 'へ', 'ほ'],
    'ma': ['ま', 'み', 'む', 'め', 'も'],
    'ya': ['や', 'ゆ', 'よ'],
    'ra': ['ら', 'り', 'る', 'れ', 'ろ'],
    'wa': ['わ', 'を', 'ん'],
}

export const getRandomCharacter = (selectedSets) => {
    const sets             = selectedSets.split(',');
    const characterSetName = sets[Math.floor(Math.random() * sets.length)];
    const characterSet     = Sets[characterSetName];
    const index            = Math.floor(Math.random() * characterSet.length);

    return {
        'romanji':          HiraganaRomanjiMap[characterSet[index]],
        'hiragana':         characterSet[index],
        'availableRomanji': characterSet.map((item) => HiraganaRomanjiMap[item]),
    };
};
