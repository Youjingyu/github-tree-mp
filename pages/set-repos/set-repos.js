/* global Page, wx */
let isInDeleting = false

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
    isInDeleting = true
    let index = e.currentTarget.dataset.index
    this.data.history.splice(index, 1)
    const history = this.data.history
    this.setData({
      history,
      iconIndex: -1
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
    if (isInDeleting) {
      isInDeleting = false
      return
    }
    let index = e.currentTarget.dataset.index
    wx.navigateTo({
      url: '/pages/index/index?repos=https://github.com/' + this.data.history[index]
    })
  },
  confirm () {
    const val = this.data.inputValue
    if (val === '') return
    if (/^http(s)?:\/\//.test(val)) {
      const repos = parseGithubUrl(val)
      if (!repos) {
        this.toast('请输入正确的github项目地址')
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
  },
  toast (toastText, duration = 1500) {
    wx.showToast({
      icon: 'none',
      title: toastText,
      duration
    })
  },
  copylink () {
    const that = this
    wx.setClipboardData({
      data: 'https://github.com/Youjingyu/github-tree-mp/issues',
      success: function (res) {
        that.toast('反馈链接已复制到剪贴板', 2000)
      }
    })
  }
})

function parseGithubUrl (text) {
  if (!/^https:\/\//.test(text)) return null
  const matches = text.match(/(https:\/\/github\.com\/[^/]+?\/[^/]+[/]{0,1})/)
  return matches && matches[1]
}
