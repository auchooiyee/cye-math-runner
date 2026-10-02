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
  let timeoutId;
  try {
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`/api/scores?limit=${limit}`, { signal: controller.signal, cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.scores)) {
        return data.scores;
      }
    }
  } catch (e) {
    // Network offline or fallback
  } finally {
    clearTimeout(timeoutId);
  }
  return null;
}

export async function submitGlobalScore(scoreData) {
  let timeoutId;
  try {
    let playerId = localStorage.getItem('CYE_MATH_RUNNER_PLAYER_ID');
    if (!playerId) {
      playerId = crypto.randomUUID();
      localStorage.setItem('CYE_MATH_RUNNER_PLAYER_ID', playerId);
    }
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...scoreData, playerId }),
      signal: controller.signal
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Network offline or fallback
  } finally {
    clearTimeout(timeoutId);
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

export function getDailyChallenge() {
  const dateKey = new Date().toLocaleDateString('en-CA');
  const seed = dateKey.split('-').join('').split('').reduce((total, digit) => total + Number(digit), 0);
  const chapter = (seed % 8) + 1;
  const difficulty = seed % 3 === 0
    ? { label: 'Daily KBAT', min: 4, max: 6 }
    : { label: 'Daily SPM', min: 2, max: 5 };
  const completion = getSetting('dailyChallenge', {});
  return {
    dateKey,
    chapter,
    difficulty,
    completed: completion.dateKey === dateKey,
    streak: completion.streak || 0
  };
}

export function completeDailyChallenge(dateKey) {
  const previous = getSetting('dailyChallenge', {});
  if (previous.dateKey === dateKey) return previous.streak || 1;

  const today = new Date(`${dateKey}T00:00:00`);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toLocaleDateString('en-CA');
  const streak = previous.dateKey === yesterdayKey ? (previous.streak || 0) + 1 : 1;
  saveSetting('dailyChallenge', { dateKey, completedAt: Date.now(), streak });
  return streak;
}

function createEmptyMastery() {
  return { version: 1, chapters: {} };
}

export function getMasteryProgress() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MASTERY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed && parsed.chapters) return parsed;
    }
  } catch (e) {
    console.warn('Failed to get mastery progress from localStorage', e);
  }
  return createEmptyMastery();
}

export function getChapterRewardState(chapterNumber) {
  const chapter = getMasteryProgress().chapters[String(chapterNumber)] || {};
  const attempted = chapter.attempted || 0;
  const correct = chapter.correct || 0;
  const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0;
  const level = chapter.level || 1;
  return {
    level,
    accuracy,
    stars: Math.max(0, Math.min(5, level - 1)),
    badgeUnlocked: level >= 3,
    bossSkinUnlocked: level >= 5
  };
}

export function getWeakestTopic(chapterNumber) {
  const chapter = getMasteryProgress().chapters[String(chapterNumber)] || {};
  const topics = chapter.topics || {};
  let weakest = null;

  Object.entries(topics).forEach(([name, data]) => {
    const attempted = data.attempted || 0;
    if (!attempted) return;
    const accuracy = Math.round(((data.correct || 0) / attempted) * 100);
    if (!weakest || accuracy < weakest.accuracy || (accuracy === weakest.accuracy && attempted > weakest.attempted)) {
      weakest = { name, accuracy, attempted };
    }
  });

  return weakest;
}

export function recordMasteryAnswer(question, correct) {
  const mastery = getMasteryProgress();
  const chapterKey = String(question.chapter);
  const topicKey = question.topic || 'General';
  const chapter = mastery.chapters[chapterKey] || {
    attempted: 0, correct: 0, streak: 0, bestStreak: 0,
    level: 1, mistakeIds: [], topics: {}
  };
  const topic = chapter.topics[topicKey] || { attempted: 0, correct: 0 };

  chapter.attempted++;
  topic.attempted++;
  if (correct) {
    chapter.correct++;
    topic.correct++;
    chapter.streak++;
    chapter.bestStreak = Math.max(chapter.bestStreak, chapter.streak);
    chapter.mistakeIds = chapter.mistakeIds.filter(id => id !== question.id);
  } else {
    chapter.streak = 0;
    chapter.mistakeIds = [question.id, ...chapter.mistakeIds.filter(id => id !== question.id)].slice(0, 12);
  }

  const accuracy = chapter.correct / chapter.attempted;
  const evidenceLevel = chapter.attempted < 3 ? 1 : Math.round(1 + accuracy * 4);
  chapter.level = Math.max(1, Math.min(5, evidenceLevel));
  chapter.topics[topicKey] = topic;
  chapter.lastPlayed = Date.now();
  mastery.chapters[chapterKey] = chapter;

  try {
    localStorage.setItem(STORAGE_KEYS.MASTERY, JSON.stringify(mastery));
  } catch (e) {
    console.warn('Failed to save mastery progress to localStorage', e);
  }
  return mastery;
}

function createEmptyLearningAnalytics() {
  return { version: 1, totals: { questionsAttempted: 0, questionsCorrect: 0, practiceSessions: 0, bossesDefeated: 0 }, runs: [] };
}

export function getLearningAnalytics() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LEARNING_ANALYTICS);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed && parsed.totals && Array.isArray(parsed.runs)) {
        parsed.totals.bossesDefeated = parsed.totals.bossesDefeated || 0;
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to get learning analytics from localStorage', e);
  }
  return createEmptyLearningAnalytics();
}

export function recordLearningRun(stats) {
  const analytics = getLearningAnalytics();
  const attempted = Number(stats.questionsAttempted) || 0;
  const correct = Number(stats.questionsCorrect) || 0;
  const bossesDefeated = Number(stats.bossesDefeated) || 0;
  const run = {
    date: new Date().toISOString(), mode: stats.mode || 'endless', isPractice: Boolean(stats.isPractice),
    practiceTopic: stats.practiceTopic || null, questionsAttempted: attempted, questionsCorrect: correct,
    accuracy: attempted ? Math.round((correct / attempted) * 100) : 0,
    bossesDefeated
  };
  analytics.totals.questionsAttempted += attempted;
  analytics.totals.questionsCorrect += correct;
  analytics.totals.bossesDefeated += bossesDefeated;
  if (run.isPractice) analytics.totals.practiceSessions++;
  analytics.runs = [run, ...analytics.runs].slice(0, 30);
  try {
    localStorage.setItem(STORAGE_KEYS.LEARNING_ANALYTICS, JSON.stringify(analytics));
  } catch (e) {
    console.warn('Failed to save learning analytics to localStorage', e);
  }
  return analytics;
}

export function getLearningSummary() {
  const analytics = getLearningAnalytics();
  const { questionsAttempted, questionsCorrect, practiceSessions } = analytics.totals;
  const recent = analytics.runs.slice(0, 5);
  return {
    questionsAttempted,
    practiceSessions,
    overallAccuracy: questionsAttempted ? Math.round((questionsCorrect / questionsAttempted) * 100) : 0,
    recentTrend: recent.length > 1 ? recent[0].accuracy - recent[recent.length - 1].accuracy : 0
  };
}
