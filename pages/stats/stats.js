const app = getApp()

Page({
  data: {
    userInfo: {},
    totalDays: 0,
    totalHours: 0,
    streakDays: 0,
    avgHours: 0,
    maxStreak: 0,
    monthDays: 0,
    completionRate: 0,
    weekData: [],
    error: false
  },

  onLoad: function () {
    this.loadUserInfo()
    this.loadStats()
  },

  onShow: function () {
    this.loadUserInfo()
    this.loadStats()
    // 应用全局主题
    if (app && app.applyTheme) {
      app.applyTheme(app.globalData.theme || 'light')
    }
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.loadStats()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  loadUserInfo: function () {
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo: userInfo
      })
    }
  },

  loadStats: function () {
    wx.showLoading({
      title: '加载中...'
    })
    this.setData({ error: false })

    wx.cloud.callFunction({
      name: 'getStats'
    }).then(res => {
      wx.hideLoading()
      if (res.result && res.result.success && res.result.data) {
        this.setData({
          ...res.result.data,
          error: false
        })
      } else {
        console.error('获取统计数据失败:', res.result && res.result.message)
        this.setData({ error: true })
      }
    }).catch(err => {
      wx.hideLoading()
      console.error('调用云函数失败:', err)
      this.setData({ error: true })
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none',
        duration: 2000
      })
    })
  },

  // 重试加载
  onRetry: function () {
    this.loadStats()
  },

  onShareAppMessage: function () {
    return {
      title: '我已经坚持打卡' + this.data.totalDays + '天了',
      path: '/pages/stats/stats'
    }
  }
})
