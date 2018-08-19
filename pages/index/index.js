import apis from '../../apis/index'
import app from '../../utils/index'

Page({
  data: {
    md: {
      nodes: []
    },
    codeRows: [],
    treeData: [],
    loadCodeError: false,
    animationData: {},
    reposPath: '',
    filePath: '',
    branches: [],
    curBranch: '',
    loading: true,
    viewType: 'md',
    viewText: ''
  },
  onLoad () {
    const repos = 'https://github.com/Youjingyu/vue-hap-tools'
    // const repos = 'https://github.com/vuejs/vue'
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
  clickCodeView () {
    this.hideMenu()
  },
  changeBranch (branch) {
    apis.setBranch(branch)
    this.setData({
      treeData: [],
      filePath: '',
      curBranch: branch,
      loading: true
    })
    return apis.getTree().then((tree) => {
      this.setData({
        treeData: tree
      })
      const readme = getReadme(tree)
      if (readme) {
        this.viewFile({
          detail: {
            url: readme.url,
            path: readme.path
          }
        })
      }
      console.log(this.data.treeData)
    })
  },
  branchPickerChange (e) {
    this.changeBranch(this.data.branches[e.detail.value])
  },
  viewFile (e) {
    this.setData({
      filePath: e.detail.path,
      loading: true
    })
    const url = e.detail.url.replace('https://api.github.com/repos/', '')
    apis.getBlob(url).then((res) => {
      this.parseFile(res, e.detail.path, () => {
        this.setData({
          loading: false
        })
      })
      this.hideMenu()
    }).catch(() => {
      this.data.loadCodeError = true
    })
  },
  parseFile (fileInfo, path, cb) {
    fileInfo = parseContent(fileInfo, path)
    console.log(fileInfo)
    const { content, type } = fileInfo
    let dataToUpdate = {}
    if (type === 'md') {
      const that = this
      app.globalUtils.wxParse('md', 'md', content, that, 5)
    } else if (type === 'language') {
      const codeRows = app.globalUtils.hightlight(content, fileInfo.languageType)
      dataToUpdate = {
        codeRows: codeRows
      }
    } else if (type === 'text') {
      dataToUpdate = {
        viewText: content
      }
    }
    this.setData(Object.assign({viewType: fileInfo.type}, dataToUpdate))
    cb && cb()
  }
})

// function treeDataSimplify (tree) {
//   const res = []
//   tree.forEach((item) => {
//     const treeItem = {name: item.name}
//     res.push(treeItem)
//     if (item.children && item.children.length > 0) {
//       treeItem.children = treeDataSimplify(item.children)
//     }
//   })
//   return res
// }
function getReadme (tree) {
  for (let i = 0; i < tree.length; i++) {
    if (tree[i].content && /^(readme|README)\.md$/.test(tree[i].content.path)) {
      return tree[i].content
    }
  }
}
const languageMap = {
  'js': 'javascript',
  'css': 'css',
  'html': 'html',
  'ts': 'typescript',
  'json': 'json'
}
const imgMap = ['png', 'jpeg', 'jpg', 'gif']
function parseContent (fileInfo, path) {
  fileInfo.type = 'nosupport'
  if (fileInfo.encoding !== 'base64') {
    return fileInfo
  }
  try {
    fileInfo.content = app.globalUtils.base64.decode(fileInfo.content)
  } catch (err) {
    return fileInfo
  }
  const matches = path.match(/\.([a-zA-Z]+)$/)
  const type = (matches && matches[1]) || ''
  if (type === 'md') {
    fileInfo.type = 'md'
  } else if (imgMap.indexOf(type) > -1) {
    fileInfo.type = 'img'
  } else if (languageMap[type]) {
    fileInfo.type = 'language'
    fileInfo.languageType = languageMap[type]
  } else {
    fileInfo.type = 'text'
  }
  return fileInfo
}
