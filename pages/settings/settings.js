const app = getApp()

Page({
  data: {
    theme: 'light',
    cacheSize: '0KB'
  },

  onLoad: function () {
    this.loadSettings()
    this.calculateCacheSize()
  },

  onShow: function () {
    this.calculateCacheSize()
    // 应用全局主题
    if (app && app.applyTheme) {
      app.applyTheme(app.globalData.theme || 'light')
    }
  },

  loadSettings: function () {
    const theme = app.globalData.theme || wx.getStorageSync('theme') || 'light'
    this.setData({
      theme: theme
    })
  },

  applyTheme: function (theme) {
    if (theme === 'dark') {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#1a1a1a'
      })
    } else {
      wx.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#4CAF50'
      })
    }
  },

  onThemeChange: function (e) {
    const theme = e.currentTarget.dataset.theme
    console.log('切换主题:', theme)
    this.setData({
      theme: theme
    })
    // 使用全局方法切换主题，切换后所有页面导航栏颜色都会变
    app.switchTheme(theme)
    wx.showToast({
      title: '主题已切换为' + (theme === 'dark' ? '深色' : '浅色'),
      icon: 'success',
      duration: 1500
    })
  },

  calculateCacheSize: function () {
    try {
      const res = wx.getStorageInfoSync()
      this.setData({
        cacheSize: res.currentSize + 'KB'
      })
    } catch (err) {
      console.error('获取缓存信息失败:', err)
    }
  },

  onClearCache: function () {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存数据吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.clearStorageSync()
            wx.showToast({
              title: '清除成功',
              icon: 'success'
            })
            this.calculateCacheSize()
            // 重新初始化
            app.doLogin()
          } catch (err) {
            wx.showToast({
              title: '清除失败',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  onExportData: function () {
    wx.showLoading({
      title: '导出中...'
    })
    wx.cloud.callFunction({
      name: 'getCheckins'
    }).then(res => {
      wx.hideLoading()
      if (res.result.success) {
        const data = res.result.data
        const dataStr = JSON.stringify(data, null, 2)
        // 简单展示导出信息
        wx.setClipboardData({
          data: dataStr,
          success: () => {
            wx.showModal({
              title: '导出成功',
              content: `共${data.length}条打卡记录已复制到剪贴板`,
              showCancel: false
            })
          }
        })
      } else {
        wx.showToast({
          title: '导出失败',
          icon: 'none'
        })
      }
    }).catch(err => {
      wx.hideLoading()
      console.error('导出失败:', err)
      wx.showToast({
        title: '导出失败',
        icon: 'none'
      })
    })
  },

  onShowAbout: function () {
    wx.showModal({
      title: '关于学习打卡',
      content: '这是一个帮助你坚持每日学习的小程序。记录每一次学习，积累每一份成长。',
      showCancel: false,
      confirmText: '我知道了'
    })
  },

  onShowHelp: function () {
    wx.showModal({
      title: '使用帮助',
      content: '1. 点击首页"完成打卡"记录学习\n2. 在统计页查看学习数据\n3. 在个人中心管理个人资料',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  onLogout: function () {
    console.log('触发退出登录')
    wx.showModal({
      title: '退出登录',
      content: '退出后将清除本地用户信息（可重新登录），确定要退出吗？',
      confirmText: '确定退出',
      cancelText: '取消',
      success: (res) => {
        console.log('用户选择:', res)
        if (res.confirm) {
          app.logout()
          wx.showToast({
            title: '已退出，正在重新登录...',
            icon: 'none',
            duration: 1500
          })
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/index/index'
            })
          }, 1500)
        }
      },
      fail: (err) => {
        console.error('弹窗失败:', err)
      }
    })
  },

  onShareAppMessage: function () {
    return {
      title: '学习打卡小程序',
      path: '/pages/index/index'
    }
  }
})
