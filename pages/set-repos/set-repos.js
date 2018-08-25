Page({
  data: {
    inputValue: ''
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
  bindKeyInput (e) {
    this.setData({
      inputValue: e.detail.value
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
