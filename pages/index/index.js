const app = getApp()

Page({
  data: {
    userInfo: {},
    checkins: [],
    todayDate: '',
    todayChecked: false,
    todayCheckin: null,
    newCheckin: {
      content: '',
      duration: '',
      notes: '',
      imageUrl: '',
      imageFileID: ''
    },
    uploading: false,
    totalDays: 0,
    streakDays: 0,
    completionRate: 0
  },

  onLoad: function () {
    this.initDate()
    this.loadUserInfo()
    this.loadCheckins()
  },

  onShow: function () {
    this.loadUserInfo()
    this.loadCheckins()
    // 应用全局主题
    if (app && app.applyTheme) {
      app.applyTheme(app.globalData.theme || 'light')
    }
  },

  onPullDownRefresh: function () {
    this.loadCheckins()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  initDate: function () {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    this.setData({
      todayDate: `${year}年${month}月${day}日`
    })
  },

  loadUserInfo: function () {
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo: userInfo
      })
    }
  },

  loadCheckins: function () {
    wx.showLoading({
      title: '加载中...'
    })
    wx.cloud.callFunction({
      name: 'getCheckins'
    }).then(res => {
      wx.hideLoading()
      if (res.result.success) {
        const checkins = res.result.data
        this.setData({
          checkins: checkins
        })
        this.calculateStats(checkins)
        this.checkTodayCheckin(checkins)
      } else {
        console.error('获取打卡记录失败:', res.result.message)
      }
    }).catch(err => {
      wx.hideLoading()
      console.error('调用云函数失败:', err)
      this.initCollection()
    })
  },

  initCollection: function () {
    wx.showLoading({
      title: '初始化中...'
    })
    wx.cloud.callFunction({
      name: 'init'
    }).then(res => {
      wx.hideLoading()
      if (res.result.success) {
        this.loadCheckins()
      } else {
        wx.showToast({
          title: '初始化失败',
          icon: 'none'
        })
      }
    }).catch(err => {
      wx.hideLoading()
      console.error('初始化集合失败:', err)
      wx.showToast({
        title: '请先开通云开发',
        icon: 'none',
        duration: 3000
      })
    })
  },

  calculateStats: function (checkins) {
    const totalDays = checkins.length

    let streakDays = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < checkins.length; i++) {
      const checkinDate = new Date(checkins[i].date)
      checkinDate.setHours(0, 0, 0, 0)

      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - i)

      if (checkinDate.getTime() === expectedDate.getTime()) {
        streakDays++
      } else {
        break
      }
    }

    const completionRate = checkins.length > 0 ? Math.min(100, Math.round((streakDays / Math.max(totalDays, 1)) * 100)) : 0

    this.setData({
      totalDays,
      streakDays,
      completionRate
    })
  },

  checkTodayCheckin: function (checkins) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayCheckin = checkins.find(item => {
      const date = new Date(item.date)
      date.setHours(0, 0, 0, 0)
      return date.getTime() === today.getTime()
    })

    if (todayCheckin) {
      this.setData({
        todayChecked: true,
        todayCheckin: todayCheckin
      })
    } else {
      this.setData({
        todayChecked: false,
        todayCheckin: null
      })
    }
  },

  onContentInput: function (e) {
    this.setData({
      'newCheckin.content': e.detail.value
    })
  },

  onDurationInput: function (e) {
    this.setData({
      'newCheckin.duration': e.detail.value
    })
  },

  onNotesInput: function (e) {
    this.setData({
      'newCheckin.notes': e.detail.value
    })
  },

  // 选择图片
  onChooseImage: function () {
    if (this.data.uploading) {
      return
    }
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: (res) => {
        const tempFile = res.tempFiles[0]
        this.uploadImage(tempFile.tempFilePath)
      },
      fail: (err) => {
        console.error('选择图片失败:', err)
      }
    })
  },

  // 上传图片到云存储
  uploadImage: function (filePath) {
    this.setData({
      uploading: true
    })
    wx.showLoading({
      title: '上传中...'
    })

    const openid = app.globalData.openid || 'anonymous'
    const cloudPath = `checkin-images/${openid}_${Date.now()}.jpg`

    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: filePath
    }).then(uploadRes => {
      wx.hideLoading()
      this.setData({
        uploading: false,
        'newCheckin.imageFileID': uploadRes.fileID,
        'newCheckin.imageUrl': filePath
      })
      wx.showToast({
        title: '上传成功',
        icon: 'success'
      })
    }).catch(err => {
      wx.hideLoading()
      this.setData({
        uploading: false
      })
      console.error('上传图片失败:', err)
      wx.showToast({
        title: '上传失败',
        icon: 'none'
      })
    })
  },

  // 删除图片
  onDeleteImage: function () {
    this.setData({
      'newCheckin.imageFileID': '',
      'newCheckin.imageUrl': ''
    })
  },

  // 预览图片
  onPreviewImage: function (e) {
    wx.previewImage({
      current: this.data.newCheckin.imageUrl,
      urls: [this.data.newCheckin.imageUrl]
    })
  },

  // 预览今日打卡图片
  onPreviewTodayImage: function () {
    if (this.data.todayCheckin && this.data.todayCheckin.imageUrl) {
      wx.previewImage({
        current: this.data.todayCheckin.imageUrl,
        urls: [this.data.todayCheckin.imageUrl]
      })
    }
  },

  // 预览历史图片
  onPreviewHistoryImage: function (e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({
      current: url,
      urls: [url]
    })
  },

  submitCheckin: function () {
    const { content, duration, notes, imageFileID } = this.data.newCheckin

    if (!content.trim()) {
      wx.showToast({
        title: '请输入学习内容',
        icon: 'none'
      })
      return
    }

    if (!duration || isNaN(parseFloat(duration)) || parseFloat(duration) <= 0) {
      wx.showToast({
        title: '请输入有效时长',
        icon: 'none'
      })
      return
    }

    if (this.data.uploading) {
      wx.showToast({
        title: '图片正在上传中...',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '打卡中...'
    })

    wx.cloud.callFunction({
      name: 'addCheckin',
      data: {
        content: content.trim(),
        duration: parseFloat(duration),
        notes: notes.trim(),
        imageFileID: imageFileID
      }
    }).then(res => {
      wx.hideLoading()
      if (res.result.success) {
        wx.showToast({
          title: '打卡成功',
          icon: 'success'
        })
        this.setData({
          newCheckin: {
            content: '',
            duration: '',
            notes: '',
            imageUrl: '',
            imageFileID: ''
          }
        })
        this.loadCheckins()
      } else {
        wx.showToast({
          title: res.result.message || '打卡失败',
          icon: 'none'
        })
      }
    }).catch(err => {
      wx.hideLoading()
      console.error('打卡失败:', err)
      wx.showToast({
        title: '打卡失败',
        icon: 'none'
      })
    })
  },

  goToDetail: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  },

  formatDate: function (dateStr) {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}月${day}日`
  },

  getWeekday: function (dateStr) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const date = new Date(dateStr)
    return weekdays[date.getDay()]
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
      title: '学习打卡小程序 - 坚持每日学习'
    }
  }
})
