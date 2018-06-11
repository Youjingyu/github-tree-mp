/* global App, wx */
// app.js
const wxParse = require('./utils/wxParse/wxParse.js').wxParse
const html2json = require('./utils/wxParse/html2json.js').html2json
const hightlight = require('./utils/highlightjs/highlight.pack.js')
const base64 = require('./utils/base64.js').Base64
App({
  onLaunch: function () {
  },
  globalUtils: {
    wxParse,
    hightlight,
    base64,
    html2json
  }
})
