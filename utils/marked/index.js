const marked = require('marked')
const htmlParser = require('../wxParse/htmlparser')
const Prism = require('../prism/prism')
const supportLanguage = require('../prism/language').supportLanguage

const renderer = new marked.Renderer()

renderer.html = function (html) {
  let res = ''
  htmlParser(html, {
    start (tagName, attrs, unary) {
      res += '<' + tagName
      for (var i = 0; i < attrs.length; i++) {
        res += ' ' + attrs[i].name + '="' + attrs[i].escaped + '"'
      }
      res += '>'
    },
    end (tag) {
      res += '</' + tag + '>'
    },
    chars (text) {
      res += text
    }
  })
  return res
}
renderer.code = function (code, type, escaped) {
  let html
  if (supportLanguage.indexOf(type) > -1) {
    html = Prism.highlight(code, Prism.languages[type], type)
  } else {
    html = escapedHtml(code)
  }
  html = html.replace(/\n/g, '<br>')
  return `<div style="background-color: #f6f8fa;padding: 10px;margin: 10px 0;">${html}</div>`
}

function escapedHtml (html) {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

module.exports = function (md) {
  return marked(md, {
    renderer,
    headerIds: false
  })
}
