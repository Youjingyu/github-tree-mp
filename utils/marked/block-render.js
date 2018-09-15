const htmlParser = require('../wxParse/htmlparser')
const Prism = require('../prism/prism')
const supportLanguage = require('../prism/language').supportLanguage
const { strDiscode } = require('../wxParse/wxDiscode')

let nodes = []

module.exports = {
  initNodes (newNodes) {
    nodes = newNodes
  },
  getNodes () {
    const generatedNodes = nodes
    // 闭包变量释放
    nodes = []
    return generatedNodes
  },
  init (renderer) {
    renderer.code = function (code, type, escaped) {
      let html
      const render = supportLanguage[type]
      if (render) {
        html = Prism.highlight(code, Prism.languages[render], render)
      } else {
        html = escapedHtml(code)
      }
      html = html.replace(/\n/g, '<br>')
      nodes.push({
        type: 'html',
        value: `<div style="background-color: #2d2d2d;color:#ccc;
        ;padding: 10px;margin: 10px 0;">${html}</div>`
      })
      return ''
    }
    renderer.blockquote = function (quote) {
      nodes.push({
        type: 'view',
        value: getBlockValue(quote),
        class: 'markdown-body-blockquote'
      })
      return ''
    }
    renderer.html = function (html) {
      let res = ''
      htmlParser(html, {
        start (tagName, attrs, unary) {
          res += '<' + tagName + ' class="markdown-body-' + tagName + '"'
          let align = ''
          let style = ''
          for (var i = 0; i < attrs.length; i++) {
            const name = attrs[i].name
            const escaped = attrs[i].escaped
            if (name === 'align') {
              align = escaped
            } else if (name === 'style') {
              style = escaped
            } else {
              res += ' ' + name + '="' + escaped + '"'
            }
          }
          if (align) style += ';text-align: center;'
          if (style) res += ' style="' + style + '"'
          res += '>'
        },
        end (tag) {
          res += '</' + tag + '>'
        },
        chars (text) {
          res += text
        }
      })
      nodes.push({
        type: 'html',
        value: res
      })
      return ''
    }
    renderer.heading = function (string, number, raw) {
      nodes.push({
        type: 'view',
        value: getBlockValue(string),
        class: 'markdown-body-h' + number
      })
      return ''
    }
    renderer.hr = function () {
      nodes.push({
        type: 'view',
        value: [''],
        class: 'markdown-body-hr'
      })
      return ''
    }
    renderer.listitem = function (string) {
      const value = [{tagName: 'listdot', text: '•  '}]
      nodes.push({
        type: 'view',
        value: value.concat(getBlockValue(string)),
        class: 'markdown-body-li'
      })
      return ''
    }
    renderer.paragraph = function (string) {
      nodes.push({
        type: 'view',
        value: getBlockValue(string),
        class: 'markdown-body-paragraph'
      })
      return ''
    }
    renderer.table = function (header, body) {
      header = header.replace(/<td/g, '<td class="markdown-body-td"').replace(/<tr/g, '<tr class="markdown-body-tr"')
      body = body.replace(/<td/g, '<td class="markdown-body-td"').replace(/<tr/g, '<tr class="markdown-body-tr"')
      nodes.push({
        type: 'html',
        value: `
          <table class="markdown-body-table">
            <thead class="markdown-body-thead">${header}</thead>
            <tbody class="markdown-body-tbody">${body}</tbody>
          </table>
        `
      })
      return ''
    }
  }
}

function escapedHtml (html) {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getBlockValue (blockString) {
  const value = []
  let tag
  htmlParser(blockString, {
    start (tagName, attrs, unary) {
      tag = { tagName }
      if (tagName === 'br') {
        tag.text = '\n'
        value.push(tag)
        tag = {}
      }
    },
    chars (text) {
      tag = tag || {}
      tag.text = strDiscode(text)
      value.push(tag)
      tag = {}
    }
  })
  return value
}
