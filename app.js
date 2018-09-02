/* global App, wx */
// app.js
const hightlight = require('./utils/prism/index.js')
const languageMap = require('./utils/prism/language.js').languageMap
const base64 = require('./utils/base64.js').Base64
const marked = require('./utils/marked/index')
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
    marked,
    hightlight,
    base64,
    languageMap
  }
})
