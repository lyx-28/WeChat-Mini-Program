Page({
  data: {
    rankings: [],
    medals: ['🥇', '🥈', '🥉']
  },

  onLoad() {
    this.loadRankings();
  },

  loadRankings() {
    const scores = wx.getStorageSync('memoryScores') || [];
    const rankings = scores.map((item, index) => ({
      rank: index + 1,
      score: item.score,
      date: item.date
    }));
    this.setData({ rankings });
  },

  showDetail(e) {
    const item = e.currentTarget.dataset.item;
    wx.showToast({
      title: `第${item.rank}名: ${item.score}分`,
      icon: 'none'
    });
  },

  goBack() {
    wx.navigateBack();
  }
});