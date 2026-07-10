import { describe, it, expect } from 'vitest';
import { hiragana, katakana, kanaGroups, getScriptCounterpart } from './kana';

describe('kana index alignment', () => {
  it('hiragana and katakana have the same length', () => {
    expect(hiragana.length).toBe(katakana.length);
  });

  it('hiragana[i] and katakana[i] share the same romaji at every index', () => {
    hiragana.forEach((h, i) => {
      expect(katakana[i].romaji).toBe(h.romaji);
    });
  });
});

describe('getScriptCounterpart', () => {
  it('maps ぢ to ヂ and NOT to ジ (duplicate romaji ji)', () => {
    const di = hiragana.find((k) => k.kana === 'ぢ');
    expect(getScriptCounterpart(di).kana).toBe('ヂ');
    expect(getScriptCounterpart(di).kana).not.toBe('ジ');
  });

  it('maps づ to ヅ and NOT to ズ (duplicate romaji zu)', () => {
    const du = hiragana.find((k) => k.kana === 'づ');
    expect(getScriptCounterpart(du).kana).toBe('ヅ');
    expect(getScriptCounterpart(du).kana).not.toBe('ズ');
  });

  it('resolves in both directions and keeps じ/ず distinct from ぢ/づ', () => {
    const ji = hiragana.find((k) => k.kana === 'じ');
    const ka = katakana.find((k) => k.kana === 'ジ');
    expect(getScriptCounterpart(ji).kana).toBe('ジ');
    expect(getScriptCounterpart(ka).kana).toBe('じ');
  });

  it('returns null for an unknown object', () => {
    expect(getScriptCounterpart({ kana: 'X', romaji: 'x' })).toBeNull();
  });

  it('resolves by kana string, not object identity (robust to clones)', () => {
    // A cloned plain object (not the array reference) must still resolve.
    expect(getScriptCounterpart({ kana: 'ぢ', romaji: 'ji' }).kana).toBe('ヂ');
    expect(getScriptCounterpart(null)).toBeNull();
  });
});

describe('kanaGroups derivation', () => {
  it('has the expected top-level and series keys in order', () => {
    expect(Object.keys(kanaGroups)).toEqual(['basic', 'dakuten', 'handakuten']);
    expect(Object.keys(kanaGroups.basic)).toEqual([
      'vowels', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w'
    ]);
    expect(Object.keys(kanaGroups.dakuten)).toEqual(['g', 'z', 'd', 'b']);
    expect(Object.keys(kanaGroups.handakuten)).toEqual(['p']);
  });

  it('places ぢ and づ in the dakuten d group', () => {
    const d = kanaGroups.dakuten.d.hiragana.map((k) => k.kana);
    expect(d).toEqual(['だ', 'ぢ', 'づ', 'で', 'ど']);
    expect(kanaGroups.dakuten.d.katakana.map((k) => k.kana))
      .toEqual(['ダ', 'ヂ', 'ヅ', 'デ', 'ド']);
  });

  // Fängt eine versehentliche Index-/Layout-Verschiebung ab: jede Gruppe muss
  // exakt ihre erwartete romaji-Sequenz führen.
  it('matches the expected romaji sequence per group', () => {
    const romaji = (g) => g.hiragana.map((k) => k.romaji);
    expect(romaji(kanaGroups.basic.vowels)).toEqual(['a', 'i', 'u', 'e', 'o']);
    expect(romaji(kanaGroups.basic.k)).toEqual(['ka', 'ki', 'ku', 'ke', 'ko']);
    expect(romaji(kanaGroups.basic.s)).toEqual(['sa', 'shi', 'su', 'se', 'so']);
    expect(romaji(kanaGroups.basic.t)).toEqual(['ta', 'chi', 'tsu', 'te', 'to']);
    expect(romaji(kanaGroups.basic.n)).toEqual(['na', 'ni', 'nu', 'ne', 'no']);
    expect(romaji(kanaGroups.basic.h)).toEqual(['ha', 'hi', 'fu', 'he', 'ho']);
    expect(romaji(kanaGroups.basic.m)).toEqual(['ma', 'mi', 'mu', 'me', 'mo']);
    expect(romaji(kanaGroups.basic.y)).toEqual(['ya', 'yu', 'yo']);
    expect(romaji(kanaGroups.basic.r)).toEqual(['ra', 'ri', 'ru', 're', 'ro']);
    expect(romaji(kanaGroups.basic.w)).toEqual(['wa', 'wo', 'n']);
    expect(romaji(kanaGroups.dakuten.g)).toEqual(['ga', 'gi', 'gu', 'ge', 'go']);
    expect(romaji(kanaGroups.dakuten.z)).toEqual(['za', 'ji', 'zu', 'ze', 'zo']);
    expect(romaji(kanaGroups.dakuten.d)).toEqual(['da', 'ji', 'zu', 'de', 'do']);
    expect(romaji(kanaGroups.dakuten.b)).toEqual(['ba', 'bi', 'bu', 'be', 'bo']);
    expect(romaji(kanaGroups.handakuten.p)).toEqual(['pa', 'pi', 'pu', 'pe', 'po']);
  });

  it('groups partition all characters without overlap', () => {
    const all = [];
    for (const type of Object.values(kanaGroups)) {
      for (const group of Object.values(type)) {
        all.push(...group.hiragana);
      }
    }
    expect(all.length).toBe(hiragana.length);
    expect(new Set(all).size).toBe(hiragana.length);
  });
});
