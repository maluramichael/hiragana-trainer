import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trackEvent } from './analytics.js';

describe('analytics.trackEvent (#90)', () => {
  beforeEach(() => {
    delete window.CookieConsent;
    delete window.owa_cmds;
  });

  afterEach(() => {
    delete window.CookieConsent;
    delete window.owa_cmds;
  });

  it('is a no-op without consent, even if the queue exists', () => {
    window.owa_cmds = [];
    window.CookieConsent = { analyticsAllowed: vi.fn().mockReturnValue(false) };

    trackEvent('quiz_finished', '95%');

    expect(window.owa_cmds).toHaveLength(0);
  });

  it('is a no-op when the OWA queue is missing', () => {
    window.CookieConsent = { analyticsAllowed: vi.fn().mockReturnValue(true) };

    // No owa_cmds array present -> must not throw.
    expect(() => trackEvent('quiz_finished', '95%')).not.toThrow();
  });

  it('pushes a trackAction command when consent is given and the queue is an array', () => {
    window.owa_cmds = [];
    window.CookieConsent = { analyticsAllowed: vi.fn().mockReturnValue(true) };

    trackEvent('challenge_created', '5');

    expect(window.owa_cmds).toHaveLength(1);
    expect(window.owa_cmds[0]).toEqual(['trackAction', 'kana', 'challenge_created', '5']);
  });
});
