Page({
  data: {
    inputValue: ''
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
      if (!/^https:\/\/github\.com\/[^/]+?\/[^/]+?[/]{0,1}$/.test(val)) {
        wx.showModal({
          title: '提示',
          content: '请输入正确的github项目地址',
          showCancel: false
        })
      } else {
        wx.navigateTo({
          url: '/pages/index/index?repos=' + val
        })
      }
    } else {
      wx.navigateTo({
        url: '/pages/search-res/search-res?query=' + val
      })
    }
  }
})
