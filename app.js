/* global App, wx */
// app.js
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
  }
})
