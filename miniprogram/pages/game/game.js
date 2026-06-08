const FRUITS = ['🍎','🍊','🍋','🍇','🍓','🍑','🍒','🥝'];

Page({
  data: {
    cards: [],
    score: 0,
    timeLeft: 60,
    matchedPairs: 0,
    totalPairs: 8,
    started: false,
    gameOver: false,
    isWin: false,
    flipping: false
  },

  timer: null,

  onLoad() {
    console.log('Memory Game Loaded');
  },

  initCards() {
    let cardPairs = [];
    FRUITS.forEach((icon, index) => {
      cardPairs.push({ id: index * 2, icon, pairId: index, flipped: false, matched: false });
      cardPairs.push({ id: index * 2 + 1, icon, pairId: index, flipped: false, matched: false });
    });
    for (let i = cardPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }
    return cardPairs;
  },

  startGame() {
    const cards = this.initCards();
    this.setData({
      cards,
      score: 0,
      timeLeft: 60,
      matchedPairs: 0,
      started: true,
      gameOver: false,
      isWin: false,
      flipping: false
    });

    this.timer = setInterval(() => {
      const t = this.data.timeLeft;
      if (t <= 1) {
        clearInterval(this.timer);
        this.endGame(false);
      } else {
        this.setData({ timeLeft: t - 1 });
      }
    }, 1000);
  },

  flipCard(e) {
    if (this.data.gameOver || this.data.flipping) return;

    const id = parseInt(e.currentTarget.dataset.id);
    const card = this.data.cards.find(c => c.id === id);

    if (!card || card.flipped || card.matched) return;

    this.setData({ flipping: true });

    const cards = [...this.data.cards];
    const idx = cards.findIndex(c => c.id === id);
    cards[idx].flipped = true;
    this.setData({ cards });

    const flipped = cards.filter(c => c.flipped && !c.matched);

    if (flipped.length === 2) {
      setTimeout(() => {
        if (flipped[0].pairId === flipped[1].pairId) {
          const updatedCards = [...this.data.cards];
          updatedCards[updatedCards.findIndex(c => c.id === flipped[0].id)].matched = true;
          updatedCards[updatedCards.findIndex(c => c.id === flipped[1].id)].matched = true;
          const newMatched = this.data.matchedPairs + 1;
          const timeBonus = this.data.timeLeft * 2;
          const newScore = this.data.score + 100 + timeBonus;
          this.setData({ cards: updatedCards, matchedPairs: newMatched, score: newScore });

          if (newMatched === this.data.totalPairs) {
            clearInterval(this.timer);
            this.saveScore(newScore);
            this.endGame(true);
          }
        } else {
          const updatedCards = [...this.data.cards];
          updatedCards[updatedCards.findIndex(c => c.id === flipped[0].id)].flipped = false;
          updatedCards[updatedCards.findIndex(c => c.id === flipped[1].id)].flipped = false;
          this.setData({ cards: updatedCards });
        }
        this.setData({ flipping: false });
      }, 600);
    } else {
      this.setData({ flipping: false });
    }
  },

  endGame(won) {
    this.setData({
      gameOver: true,
      isWin: won
    });
  },

  saveScore(score) {
    const scores = wx.getStorageSync('memoryScores') || [];
    scores.push({
      score,
      date: new Date().toLocaleDateString()
    });
    scores.sort((a, b) => b.score - a.score);
    wx.setStorageSync('memoryScores', scores.slice(0, 10));
  },

  goToRanking() {
    wx.navigateTo({ url: '/pages/ranking/ranking' });
  },

  onUnload() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
});