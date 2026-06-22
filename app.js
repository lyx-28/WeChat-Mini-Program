App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-d8gts0h248dc09e04',
        traceUser: true
      })
    }

    this.globalData = {
      userInfo: null,
      openid: '',
      checkins: [],
      theme: 'light'
    }

    // 加载保存的主题
    const savedTheme = wx.getStorageSync('theme') || 'light'
    this.globalData.theme = savedTheme
    this.applyTheme(savedTheme)

    this.checkLogin()
  },

  // 应用主题到导航栏
  applyTheme: function (theme) {
    this.globalData.theme = theme
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

  // 切换主题（全局）
  switchTheme: function (theme) {
    wx.setStorageSync('theme', theme)
    this.applyTheme(theme)
  },

  // 检查登录状态
  checkLogin: function () {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo && userInfo.openid) {
      this.globalData.userInfo = userInfo
      this.globalData.openid = userInfo.openid
    } else {
      this.doLogin()
    }
  },

  // 执行登录
  doLogin: function () {
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      if (res.result && res.result.openid) {
        this.globalData.openid = res.result.openid
        this.fetchUserProfile()
      }
    }).catch(err => {
      console.error('登录失败:', err)
    })
  },

  // 获取用户信息
  fetchUserProfile: function () {
    wx.cloud.callFunction({
      name: 'getUserProfile'
    }).then(res => {
      if (res.result && res.result.success && res.result.data) {
        const userInfo = res.result.data
        this.globalData.userInfo = userInfo
        wx.setStorageSync('userInfo', userInfo)
      }
    }).catch(err => {
      console.error('获取用户信息失败:', err)
    })
  },

  // 更新全局用户信息
  updateUserInfo: function (userInfo) {
    this.globalData.userInfo = userInfo
    wx.setStorageSync('userInfo', userInfo)
  },

  // 退出登录
  logout: function () {
    this.globalData.userInfo = null
    this.globalData.openid = ''
    wx.removeStorageSync('userInfo')
    // 立即重新登录获取新的 openid
    this.doLogin()
  },

  globalData: {}
})
