import { getMasteryProgress, recordMasteryAnswer } from '../utils/Storage.js';

export default class QuestionSystem {
  constructor() {
    this.questions = [];
    this.usedQuestionIds = new Set();
    this.chapterStats = {};
    this.mistakes = [];
    this.mastery = getMasteryProgress();
  }
  
  loadQuestions(jsonData) {
    this.questions = jsonData;
    this.questions.forEach(q => {
      if (!this.chapterStats[q.chapter]) {
        this.chapterStats[q.chapter] = { asked: 0, correct: 0 };
      }
    });
  }
  
  getRandomQuestion(chapter = null, minDifficulty = 1, maxDifficulty = 6, preferredTopic = null) {
    let filtered = this.questions.filter(q => {
      let chMatch = chapter ? q.chapter === chapter : true;
      let diffMatch = q.difficulty >= minDifficulty && q.difficulty <= maxDifficulty;
      return chMatch && diffMatch && !q.bossOnly;
    });
    
    let available = filtered.filter(q => !this.usedQuestionIds.has(q.id));
    
    if (available.length === 0) {
      if (filtered.length === 0) return null; // No questions match criteria
      
      // Reset used questions for this subset
      filtered.forEach(q => this.usedQuestionIds.delete(q.id));
      available = filtered;
    }
    
    const q = this.pickAdaptiveQuestion(available, chapter, minDifficulty, maxDifficulty, preferredTopic);
    this.usedQuestionIds.add(q.id);
    return q;
  }

  pickAdaptiveQuestion(questions, chapter, minDifficulty, maxDifficulty, preferredTopic = null) {
    const weighted = questions.map(question => {
      const progress = this.mastery.chapters[String(question.chapter)];
      const accuracy = progress?.attempted ? progress.correct / progress.attempted : 0.5;
      const targetLevel = Math.max(minDifficulty, Math.min(maxDifficulty, progress?.level || minDifficulty));
      const difficultyWeight = Math.max(1, 4 - Math.abs(question.difficulty - targetLevel));
      const retryWeight = progress?.mistakeIds?.includes(question.id) ? 4 : 0;
      const weakChapterWeight = chapter ? 0 : Math.max(0, (0.75 - accuracy) * 4);
      const preferredTopicWeight = preferredTopic && question.topic === preferredTopic ? 10 : 0;
      return { question, weight: difficultyWeight + retryWeight + weakChapterWeight + preferredTopicWeight };
    });

    const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const item of weighted) {
      roll -= item.weight;
      if (roll <= 0) return item.question;
    }
    return weighted[weighted.length - 1].question;
  }
  
  getBossQuestion(chapter = null) {
    let filtered = this.questions.filter(q => q.difficulty >= 3 && q.bossEligible);
    if (chapter) filtered = filtered.filter(q => q.chapter === chapter);
    if (chapter === 2) {
      const repairQuestions = filtered.filter(q => q.type === 'matrixRepair');
      if (repairQuestions.length) filtered = repairQuestions;
    }
    if (filtered.length === 0) return this.getRandomQuestion(chapter, 3, 6);
    let available = filtered.filter(q => !this.usedQuestionIds.has(q.id));
    if (available.length === 0) {
      filtered.forEach(q => this.usedQuestionIds.delete(q.id));
      available = filtered;
    }
    const question = this.pickAdaptiveQuestion(available, chapter, 3, 6);
    this.usedQuestionIds.add(question.id);
    return question;
  }
  
  validateAnswer(questionId, answerIndex) {
    const q = this.questions.find(x => x.id === questionId);
    if (!q) return { correct: false };
    const isRepair = q.type === 'matrixRepair';
    const selectedAnswer = isRepair ? String(answerIndex).trim() : (q.options[answerIndex] || 'No answer');
    const correctAnswer = isRepair ? String(q.answerValue) : q.options[q.answer];
    const correct = isRepair ? selectedAnswer === correctAnswer : answerIndex === q.answer;
    
    this.chapterStats[q.chapter].asked++;
    if (correct) {
      this.chapterStats[q.chapter].correct++;
    } else {
      this.mistakes.push({
        id: q.id,
        type: q.type,
        chapter: q.chapter,
        topic: q.topic || '',
        question: q.question,
        selectedAnswer,
        correctAnswer,
        explanation: q.explanation || ''
      });
    }
    this.mastery = recordMasteryAnswer(q, correct);
    
    return {
      correct,
      hint: q.hint || `First identify the ${q.topic || 'mathematics'} rule, then substitute the known values carefully.`,
      explanation: q.explanation || '',
      correctAnswer,
      selectedAnswer
    };
  }

  getMistakes() {
    return this.mistakes.map(mistake => ({ ...mistake }));
  }

  getMasteryProgress() {
    const result = {};
    for (let chapter = 1; chapter <= 8; chapter++) {
      const data = this.mastery.chapters[String(chapter)] || {};
      const attempted = data.attempted || 0;
      const correct = data.correct || 0;
      result[chapter] = {
        attempted,
        correct,
        accuracy: attempted ? Math.round((correct / attempted) * 100) : 0,
        level: data.level || 1,
        streak: data.streak || 0,
        bestStreak: data.bestStreak || 0
      };
    }
    return result;
  }

  getTopicStats(chapter, topic) {
    const data = this.mastery.chapters[String(chapter)]?.topics?.[topic] || {};
    const attempted = data.attempted || 0;
    const correct = data.correct || 0;
    return {
      attempted,
      correct,
      accuracy: attempted ? Math.round((correct / attempted) * 100) : 0
    };
  }
  
  getChapterStats() {
    let stats = {};
    for (const [chap, data] of Object.entries(this.chapterStats)) {
      stats[chap] = {
        asked: data.asked,
        correct: data.correct,
        accuracy: data.asked > 0 ? Math.round((data.correct / data.asked) * 100) : 0
      };
    }
    return stats;
  }
  
  getTotalStats() {
    let totalAsked = 0;
    let totalCorrect = 0;
    for (const data of Object.values(this.chapterStats)) {
      totalAsked += data.asked;
      totalCorrect += data.correct;
    }
    return {
      totalAsked,
      totalCorrect,
      accuracy: totalAsked > 0 ? Math.round((totalCorrect / totalAsked) * 100) : 0
    };
  }
  
  reset() {
    this.usedQuestionIds.clear();
    this.mistakes = [];
    for (const chap in this.chapterStats) {
      this.chapterStats[chap] = { asked: 0, correct: 0 };
    }
  }
}
