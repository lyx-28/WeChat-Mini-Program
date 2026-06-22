Page({
  data: {
    checkin: null,
    showEdit: false,
    editData: {
      content: '',
      duration: '',
      notes: ''
    }
  },

  onLoad: function (options) {
    const app = getApp()
    if (app && app.applyTheme) {
      app.applyTheme(app.globalData.theme || 'light')
    }
    const id = options.id
    if (id) {
      this.loadCheckin(id)
    }
  },

  onShow: function () {
    const app = getApp()
    if (app && app.applyTheme) {
      app.applyTheme(app.globalData.theme || 'light')
    }
  },

  loadCheckin: function (id) {
    wx.showLoading({
      title: '加载中...'
    })
    wx.cloud.callFunction({
      name: 'getCheckinById',
      data: {
        id: id
      }
    }).then(res => {
      wx.hideLoading()
      if (res.result.success) {
        this.setData({
          checkin: res.result.data,
          editData: {
            content: res.result.data.content,
            duration: String(res.result.data.duration),
            notes: res.result.data.notes
          }
        })
      } else {
        wx.showToast({
          title: res.result.message || '获取记录失败',
          icon: 'none'
        })
      }
    }).catch(err => {
      wx.hideLoading()
      console.error('获取打卡记录失败:', err)
      wx.showToast({
        title: '获取记录失败',
        icon: 'none'
      })
    })
  },

  editCheckin: function () {
    this.setData({
      showEdit: true
    })
  },

  closeEdit: function () {
    this.setData({
      showEdit: false
    })
  },

  stopPropagation: function () {
  },

  onEditContent: function (e) {
    this.setData({
      'editData.content': e.detail.value
    })
  },

  onEditDuration: function (e) {
    this.setData({
      'editData.duration': e.detail.value
    })
  },

  onEditNotes: function (e) {
    this.setData({
      'editData.notes': e.detail.value
    })
  },

  saveEdit: function () {
    const { content, duration, notes } = this.data.editData
    const id = this.data.checkin._id

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

    wx.showLoading({
      title: '保存中...'
    })

    wx.cloud.callFunction({
      name: 'updateCheckin',
      data: {
        id: id,
        content: content.trim(),
        duration: parseFloat(duration),
        notes: notes.trim()
      }
    }).then(res => {
      wx.hideLoading()
      if (res.result.success) {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        })
        this.closeEdit()
        this.loadCheckin(id)
      } else {
        wx.showToast({
          title: res.result.message || '保存失败',
          icon: 'none'
        })
      }
    }).catch(err => {
      wx.hideLoading()
      console.error('保存失败:', err)
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    })
  },

  deleteCheckin: function () {
    const id = this.data.checkin._id

    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中...'
          })

          wx.cloud.callFunction({
            name: 'deleteCheckin',
            data: {
              id: id
            }
          }).then(res => {
            wx.hideLoading()
            if (res.result.success) {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              setTimeout(() => {
                wx.navigateBack()
              }, 1500)
            } else {
              wx.showToast({
                title: res.result.message || '删除失败',
                icon: 'none'
              })
            }
          }).catch(err => {
            wx.hideLoading()
            console.error('删除失败:', err)
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
          })
        }
      }
    })
  },

  formatDay: function (dateStr) {
    const date = new Date(dateStr)
    return String(date.getDate())
  },

  formatMonth: function (dateStr) {
    const date = new Date(dateStr)
    return `${date.getFullYear()}年${date.getMonth() + 1}月`
  },

  getWeekday: function (dateStr) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const date = new Date(dateStr)
    return weekdays[date.getDay()]
  },

  formatTime: function (timeStr) {
    if (!timeStr) return ''
    const date = new Date(timeStr)
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }
})