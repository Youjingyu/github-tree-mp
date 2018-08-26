const Prism = require('./prism')
const htmlParser = require('../wxParse/htmlparser')

module.exports = function (codeString, type) {
  let html = Prism.highlight(codeString, Prism.languages[type], type)
  let codeSegments = html.split(/\n/)
  const codeRows = []
  codeSegments.forEach((segment) => {
    if (segment === '') {
      return codeRows.push([{text: ''}])
    }
    const res = []
    const spaces = segment.match(/^(\s+)/)
    if (spaces) {
      res.push({
        text: spaces[1]
      })
    }
    let className
    htmlParser(segment, {
      start (tagName, attrs, unary) {
        className = getClass(attrs)
      },
      end (tag) {
      },
      chars (text) {
        if (className !== '') {
          res.push({
            class: className,
            text
          })
        } else {
          res.push({
            text
          })
        }
        className = ''
      }
    })
    codeRows.push(res)
  })
  return codeRows
}

function getClass (attrs = []) {
  for (let i = 0; i < attrs.length; i++) {
    if (attrs[i].name === 'class') {
      return attrs[i].value
    }
  }
  return ''
}
