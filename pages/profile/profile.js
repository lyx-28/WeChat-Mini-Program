const app = getApp()

Page({
  data: {
    userInfo: {},
    stats: {
      totalDays: 0,
      streakDays: 0,
      totalHours: 0
    }
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

  loadUserInfo: function () {
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo: userInfo
      })
    }
  },

  loadStats: function () {
    wx.cloud.callFunction({
      name: 'getStats'
    }).then(res => {
      if (res.result.success && res.result.data) {
        this.setData({
          stats: {
            totalDays: res.result.data.totalDays,
            streakDays: res.result.data.streakDays,
            totalHours: res.result.data.totalHours
          }
        })
      }
    }).catch(err => {
      console.error('加载统计失败:', err)
    })
  },

  onChooseAvatar: function () {
    // 头像功能已移除
  },

  onEditNickname: function () {
    const currentNickname = this.data.userInfo.nickName || ''
    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入新昵称',
      content: currentNickname,
      success: (res) => {
        if (res.confirm && res.content && res.content.trim()) {
          this.updateNickname(res.content.trim())
        }
      }
    })
  },

  updateNickname: function (nickName) {
    wx.showLoading({
      title: '更新中...'
    })
    wx.cloud.callFunction({
      name: 'updateUserProfile',
      data: {
        nickName: nickName
      }
    }).then(res => {
      wx.hideLoading()
      if (res.result.success) {
        const userInfo = res.result.data
        this.setData({
          userInfo: userInfo
        })
        app.updateUserInfo(userInfo)
        wx.showToast({
          title: '昵称更新成功',
          icon: 'success'
        })
      } else {
        wx.showToast({
          title: '更新失败',
          icon: 'none'
        })
      }
    }).catch(err => {
      wx.hideLoading()
      console.error('更新昵称失败:', err)
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      })
    })
  },

  goToHistory: function () {
    wx.showToast({
      title: '打卡历史在首页查看',
      icon: 'none'
    })
  },

  goToStats: function () {
    wx.switchTab({
      url: '/pages/stats/stats'
    })
  },

  goToSettings: function () {
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  },

  onShare: function () {
    wx.showModal({
      title: '分享给好友',
      content: '点击右上角「···」菜单，选择「转发」或「分享到朋友圈」即可分享给好友',
      showCancel: false,
      confirmText: '我知道了'
    })
  },

  onShareAppMessage: function () {
    return {
      title: '我在用学习打卡小程序，一起来坚持学习吧！',
      path: '/pages/index/index',
      imageUrl: ''
    }
  },

  onShareTimeline: function () {
    return {
      title: '学习打卡小程序 - 坚持每日学习',
      query: ''
    }
  }
})
