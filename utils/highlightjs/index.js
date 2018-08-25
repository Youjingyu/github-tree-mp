const hightlight = require('./highlight.pack.js')
const html2json = require('../wxParse/html2json.js').html2json

module.exports = function (codeString, type) {
  let html = ''
  if (!type || type === 'auto') {
    html = hightlight.highlightAuto(type, codeString).value
  } else {
    html = hightlight.highlight(type, codeString).value
  }
  let codeSegments = html.split(/\n/)
  const codeRows = []
  codeSegments.forEach((segment) => {
    const res = []
    const spaces = segment.match(/^(\s+)</)
    if (spaces) {
      res.push({
        text: spaces[1]
      })
    }
    const htmlJson = html2json(segment)
    htmlJson.nodes.forEach((node) => {
      if (node.node === 'text') {
        res.push({
          text: node.text
        })
      } else if (node.node === 'element') {
        res.push({
          class: node.classStr,
          text: node.nodes[0].text
        })
      }
    })
    codeRows.push(res)
  })
  return codeRows
}
