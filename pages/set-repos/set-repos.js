Page({
  data: {
    inputValue: '',
    history: [],
    iconIndex: -1
  },
  onReady () {
    const that = this
    wx.getClipboardData({
      success (res) {
        const repos = parseGithubUrl(res.data)
        if (repos) {
          that.setData({
            inputValue: repos
          })
        }
      }
    })
  },
  onShow () {
    const that = this
    wx.getStorage({
      key: 'history',
      success: function (res) {
        that.setData({
          history: res.data
        })
      }
    })
  },
  longpress (e) {
    let index = e.currentTarget.dataset.index
    if (index === this.data.iconIndex) {
      index = -1
    }
    this.setData({
      iconIndex: index
    })
  },
  delete (e) {
    let index = e.currentTarget.dataset.index
    this.data.history.splice(index, 1)
    const history = this.data.history
    this.setData({
      history
    })
    wx.setStorageSync('history', history)
  },
  // emptyHistory () {
  //   wx.setStorageSync('history', [])
  // },
  bindKeyInput (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  clickHistory (e) {
    let index = e.currentTarget.dataset.index
    wx.navigateTo({
      url: '/pages/index/index?repos=' + this.data.history[index]
    })
  },
  confirm () {
    const val = this.data.inputValue
    if (val === '') return
    if (/^http(s)?:\/\//.test(val)) {
      const repos = parseGithubUrl(val)
      if (!repos) {
        wx.showModal({
          content: '请输入正确的github项目地址',
          showCancel: false
        })
        return
      }
      wx.navigateTo({
        url: '/pages/index/index?repos=' + val
      })
    } else {
      wx.navigateTo({
        url: '/pages/search-res/search-res?query=' + val
      })
    }
  }
})

function parseGithubUrl (text) {
  if (!/^https:\/\//.test(text)) return null
  const matches = text.match(/(https:\/\/github\.com\/[^/]+?\/[^/]+[/]{0,1})/)
  return matches && matches[1]
}
