export default class QuestionSystem {
  constructor() {
    this.questions = [];
    this.usedQuestionIds = new Set();
    this.chapterStats = {};
  }
  
  loadQuestions(jsonData) {
    this.questions = jsonData;
    this.questions.forEach(q => {
      if (!this.chapterStats[q.chapter]) {
        this.chapterStats[q.chapter] = { asked: 0, correct: 0 };
      }
    });
  }
  
  getRandomQuestion(chapter = null, minDifficulty = 1, maxDifficulty = 6) {
    let filtered = this.questions.filter(q => {
      let chMatch = chapter ? q.chapter === chapter : true;
      let diffMatch = q.difficulty >= minDifficulty && q.difficulty <= maxDifficulty;
      return chMatch && diffMatch;
    });
    
    let available = filtered.filter(q => !this.usedQuestionIds.has(q.id));
    
    if (available.length === 0) {
      if (filtered.length === 0) return null; // No questions match criteria
      
      // Reset used questions for this subset
      filtered.forEach(q => this.usedQuestionIds.delete(q.id));
      available = filtered;
    }
    
    const q = available[Math.floor(Math.random() * available.length)];
    this.usedQuestionIds.add(q.id);
    return q;
  }
  
  getBossQuestion(chapter = null) {
    let filtered = this.questions.filter(q => q.difficulty >= 3 && q.bossEligible);
    if (chapter) filtered = filtered.filter(q => q.chapter === chapter);
    if (filtered.length === 0) return this.getRandomQuestion(chapter, 3, 6);
    return filtered[Math.floor(Math.random() * filtered.length)];
  }
  
  validateAnswer(questionId, answerIndex) {
    const q = this.questions.find(x => x.id === questionId);
    if (!q) return { correct: false };
    
    const correct = (answerIndex === q.answer);
    
    this.chapterStats[q.chapter].asked++;
    if (correct) {
      this.chapterStats[q.chapter].correct++;
    }
    
    return {
      correct,
      explanation: q.explanation || '',
      correctAnswer: q.options[q.answer]
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
    for (const chap in this.chapterStats) {
      this.chapterStats[chap] = { asked: 0, correct: 0 };
    }
  }
}
