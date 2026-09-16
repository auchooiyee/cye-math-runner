import { STORAGE_KEYS } from '../config/constants.js';

export function saveScore(scoreData) {
  try {
    let scores = getTopScores(100);
    scores.push(scoreData);
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 10);
    localStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(scores));
  } catch (e) {
    console.warn('Failed to save score to localStorage', e);
  }
}

export function getTopScores(limit = 10) {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HIGH_SCORES);
    if (data) {
      const scores = JSON.parse(data);
      return scores.slice(0, limit);
    }
  } catch (e) {
    console.warn('Failed to get scores from localStorage', e);
  }
  return [];
}

export async function fetchGlobalScores(limit = 10) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`/api/scores?limit=${limit}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data && data.scores) {
        return data.scores;
      }
    }
  } catch (e) {
    // Network offline or fallback
  }
  return null;
}

export async function submitGlobalScore(scoreData) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scoreData),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Network offline or fallback
  }
  return null;
}

export function clearScores() {
  try {
    localStorage.removeItem(STORAGE_KEYS.HIGH_SCORES);
  } catch (e) {
    console.warn('Failed to clear scores from localStorage', e);
  }
}

export function saveSetting(key, value) {
  try {
    let settings = {};
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      settings = JSON.parse(data);
    }
    settings[key] = value;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save setting to localStorage', e);
  }
}

export function getSetting(key, defaultValue) {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      const settings = JSON.parse(data);
      if (settings[key] !== undefined) {
        return settings[key];
      }
    }
  } catch (e) {
    console.warn('Failed to get setting from localStorage', e);
  }
  return defaultValue;
}

export function getPlayerName() {
  try {
    const name = localStorage.getItem('CYE_MATH_RUNNER_PLAYER_NAME');
    if (name) return name;
  } catch (e) {
    console.warn('Failed to get player name from localStorage', e);
  }
  return 'PLAYER';
}

export function savePlayerName(name) {
  try {
    localStorage.setItem('CYE_MATH_RUNNER_PLAYER_NAME', name);
  } catch (e) {
    console.warn('Failed to save player name to localStorage', e);
  }
}

export function getLanguage() {
  try {
    const lang = localStorage.getItem('CYE_MATH_RUNNER_LANGUAGE');
    if (lang === 'en' || lang === 'bm') {
      return lang;
    }
  } catch (e) {
    console.warn('Failed to get language from localStorage', e);
  }
  return 'en';
}

export function saveLanguage(lang) {
  try {
    localStorage.setItem('CYE_MATH_RUNNER_LANGUAGE', lang);
  } catch (e) {
    console.warn('Failed to save language to localStorage', e);
  }
}
