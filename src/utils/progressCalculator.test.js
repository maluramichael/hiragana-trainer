import { describe, it, expect } from 'vitest';
import { getLevelColor } from './progressCalculator.js';

// Extract the hue (in degrees) from an "hsl(h, s%, l%)" string.
const hueOf = (color) => {
  const match = /^hsl\((\d+),/.exec(color);
  return match ? Number(match[1]) : null;
};

describe('getLevelColor', () => {
  it('returns neutral gray for level 0 (not started)', () => {
    expect(getLevelColor(0)).toBe('#e5e7eb');
  });

  it('returns an HSL string for progress levels 1-10', () => {
    for (let level = 1; level <= 10; level++) {
      expect(getLevelColor(level)).toMatch(/^hsl\(\d+, 75%, 45%\)$/);
    }
  });

  it('makes the lowest progress level reddish (hue near 0°)', () => {
    expect(hueOf(getLevelColor(1))).toBeLessThanOrEqual(15);
  });

  it('makes the highest progress level greenish (hue near 120°)', () => {
    expect(hueOf(getLevelColor(10))).toBeGreaterThanOrEqual(105);
  });

  it('increases the hue monotonically as the level rises (never redder for higher levels)', () => {
    let previous = -1;
    for (let level = 1; level <= 10; level++) {
      const hue = hueOf(getLevelColor(level));
      expect(hue).toBeGreaterThan(previous);
      previous = hue;
    }
  });

  it('no longer maps advanced levels 7/8 onto the error red palette', () => {
    expect(getLevelColor(7)).not.toBe('#dc2626');
    expect(getLevelColor(8)).not.toBe('#b91c1c');
    // Their hue must sit clearly on the green side of the ramp, not red.
    expect(hueOf(getLevelColor(7))).toBeGreaterThan(60);
    expect(hueOf(getLevelColor(8))).toBeGreaterThan(60);
  });

  it('clamps out-of-range levels to the highest color', () => {
    expect(getLevelColor(11)).toBe(getLevelColor(10));
  });
});
