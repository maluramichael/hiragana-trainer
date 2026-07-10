import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const here = dirname(fileURLToPath(import.meta.url));
const indexCss = readFileSync(resolve(here, '../index.css'), 'utf8');

describe('global accessibility CSS', () => {
  it('defines a visible :focus-visible rule for interactive elements', () => {
    expect(indexCss).toMatch(/:focus-visible/);
    expect(indexCss).toMatch(/outline:/);
  });

  it('honours prefers-reduced-motion: reduce', () => {
    expect(indexCss).toMatch(/prefers-reduced-motion:\s*reduce/);
  });
});
