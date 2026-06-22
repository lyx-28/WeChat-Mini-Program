Component({
  data: {
    selectedPath: '',
    list: [
      {
        pagePath: '/pages/index/index',
        text: '打卡',
        icon: '📝'
      },
      {
        pagePath: '/pages/stats/stats',
        text: '统计',
        icon: '📊'
      },
      {
        pagePath: '/pages/profile/profile',
        text: '我的',
        icon: '👤'
      }
    ]
  },

  ready: function () {
    this.updateSelectedPath()
  },

  pageLifetimes: {
    show: function () {
      this.updateSelectedPath()
    }
  },

  methods: {
    updateSelectedPath: function () {
      const pages = getCurrentPages()
      if (pages.length === 0) return
      const currentPage = pages[pages.length - 1]
      if (!currentPage || !currentPage.route) return
      this.setData({
        selectedPath: '/' + currentPage.route
      })
    },

    switchTab: function (e) {
      const path = e.currentTarget.dataset.path
      const selectedPath = this.data.selectedPath
      if (path === selectedPath) {
        return
      }
      wx.switchTab({
        url: path,
        fail: function (err) {
          console.error('切换tab失败:', err)
        }
      })
    }
  }
})
