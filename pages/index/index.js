import apis from '../../apis/index'
import app from '../../utils/index'

apis.setResp('https://github.com/Youjingyu/vue-hap-tools/')

Page({
  data: {
    code: {
      nodes: []
    },
    codeRows: [],
    tree: [],
    treeData: [],
    loadCodeError: false,
    animationData: {}
  },
  onLoad () {
    apis.getTree().then((tree) => {
      this.setData({
        tree,
        treeData: treeDataSimplify(tree)
      })
      console.log(this.data.tree)
    }).catch(() => {
      this.data.loadCodeError = true
    })
  },
  onReady () {
    const animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease'
    })
    this.animation = animation
    this.setData({
      animationData: this.animation.export()
    })
  },
  showMenu () {
    this.animation.left('0rpx').step()
    this.setData({
      animationData: this.animation.export()
    })
  },
  hideMenu () {
    this.animation.left('-600rpx').step()
    this.setData({
      animationData: this.animation.export()
    })
  },
  viewFile (e) {
    const url = e.detail.url.replace('https://api.github.com/repos/', '')
    apis.getBlob(url).then((codeString) => {
      let html = app.globalUtils.hightlight.highlight('javascript', codeString).value
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
        const htmlJson = app.globalUtils.html2json(segment)
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
      this.setData({
        codeRows: codeRows
      })
      // app.globalUtils.wxParse('code', 'html', html, this, 5)
    }).catch(() => {
      this.data.loadCodeError = true
    })
  }
})

function treeDataSimplify (tree) {
  const res = []
  tree.forEach((item) => {
    const treeItem = {name: item.name}
    res.push(treeItem)
    if (item.children && item.children.length > 0) {
      treeItem.children = treeDataSimplify(item.children)
    }
  })
  return res
}
