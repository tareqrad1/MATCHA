// Tracks whether the cinematic splash/intro has already played this browser
// session. Persisted in sessionStorage so it survives in-app navigation and
// refreshes within the same tab, but replays in a brand-new tab/session.

const KEY = 'matcha.introSeen.v1';

export function hasSeenIntro(): boolean {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function markIntroSeen(): void {
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    /* sessionStorage unavailable (private mode quota, etc.) — show intro */
  }
}
