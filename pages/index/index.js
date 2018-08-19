import apis from '../../apis/index'
import app from '../../utils/index'

Page({
  data: {
    codeRows: [],
    tree: [],
    treeData: [],
    loadCodeError: false,
    animationData: {},
    reposPath: '',
    filePath: '',
    branches: [],
    curBranch: ''
  },
  onLoad () {
    const repos = 'https://github.com/Youjingyu/vue-hap-tools/'
    apis.setResp(repos)
    this.setData({
      reposPath: repos.replace('https://github.com/', '').replace(/\/$/, '')
    })
    apis.getReopInfo().then((res) => {
      return this.changeBranch(res.default_branch)
    }).catch(() => {
      this.data.loadCodeError = true
    })
    apis.getBranches().then((res) => {
      // github按照创建时间倒序返回branches
      // 这里按照时间从旧到新显示
      const branch = res.reverse().map((item) => {
        return item.name
      })
      this.setData({
        branches: branch
      })
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
  changeBranch (branch) {
    apis.setBranch(branch)
    this.setData({
      codeRows: [],
      tree: [],
      treeData: [],
      filePath: '',
      curBranch: branch
    })
    return apis.getTree().then((tree) => {
      this.setData({
        tree,
        treeData: treeDataSimplify(tree)
      })
      console.log(this.data.tree)
    })
  },
  branchPickerChange (e) {
    this.changeBranch(this.data.branches[e.detail.value])
  },
  viewFile (e) {
    this.setData({
      filePath: e.detail.path
    })
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
