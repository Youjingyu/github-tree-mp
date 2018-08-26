/* global App, wx */
// app.js
const wxParse = require('./utils/wxParse/wxParse.js').wxParse
const hightlight = require('./utils/prism/index.js')
const base64 = require('./utils/base64.js').Base64
App({
  onLaunch: function () {
  },
  onError (error) {
    wx.showToast({
      icon: 'none',
      title: error,
      duration: 200
    })
  },
  globalUtils: {
    wxParse,
    hightlight,
    base64
  }
})
