const marked = require('./marked')
const blockRender = require('./block-render')

const renderer = new marked.Renderer()
blockRender.init(renderer)

module.exports = function (md, imgPath) {
  const nodes = []
  blockRender.initNodes(nodes)
  marked(md, {
    renderer,
    headerIds: false,
    baseUrl: imgPath,
    breaks: true
  })
  return blockRender.getNodes()
}
