/* global App, wx */
// app.js
const wxParse = require('./utils/wxParse/wxParse.js').wxParse
const hightlight = require('./utils/prism/index.js')

App({
  onLaunch: function () {
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log('has new version: ' + res.hasUpdate)
    })
  },
  onError (error) {
    wx.showToast({
      icon: 'none',
      title: error,
      duration: 2000
    })
  },
  globalUtils: {
    wxParse,
    hightlight
  }
})
