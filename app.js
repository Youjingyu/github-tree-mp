/* global App, wx */
// app.js
const wxParse = require('./utils/wxParse/wxParse.js').wxParse
const hightlight = require('./utils/prism/index.js')

App({
  onLaunch: function () {
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
