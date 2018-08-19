/* global App, wx */
// app.js
const wxParse = require('./utils/wxParse/wxParse.js').wxParse
const hightlight = require('./utils/highlightjs/index.js')
const base64 = require('./utils/base64.js').Base64
App({
  onLaunch: function () {
  },
  globalUtils: {
    wxParse,
    hightlight,
    base64
  }
})
