import apis from '../../apis/index'
import app from '../../utils/index'

const hightlight = app.globalUtils.hightlight

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
    // loading: true,
    viewType: 'md',
    viewText: '',
    viewImgSrc: '',
    stargazers_count: '',
    forks: '',
    imgStyle: ''
  },
  toast (toastText) {
    wx.showToast({
      icon: 'none',
      title: toastText,
      duration: 1500
    })
  },
  loading (show = true) {
    show ? wx.showLoading({
      title: '正在加载'
    }) : wx.hideLoading()
  },
  onLoad (option) {
    this.loading()
    // const repos = option.repos
    const repos = 'https://github.com/Youjingyu/vue-hap-tools'
    // const repos = 'https://github.com/vuejs/vue'
    apis.setResp(repos)
    const reposPath = repos.replace('https://github.com/', '').replace(/\/$/, '')
    this.setData({
      reposPath: reposPath,
      filePath: reposPath
    })
    apis.getReopInfo().then((res) => {
      this.setData({
        stargazers_count: res.stargazers_count,
        forks: res.forks
      })
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
    this.loading()
    return apis.getTree().then((tree) => {
      this.setData({
        curBranch: branch,
        treeData: tree,
        loading: false
      })
      this.loading(false)
      this.showMenu()
      console.log(this.data.treeData)
    })
  },
  branchPickerChange (e) {
    this.changeBranch(this.data.branches[e.detail.value])
  },
  viewFile (e) {
    this.loading()
    const path = e.detail.path
    this.setData({
      filePath: path
    })
    this.hideMenu()
    const fileInfo = getFileInfo(path)
    if (fileInfo.type === 'img') {
      this.setData({
        viewType: fileInfo.type,
        viewImgSrc: apis.getImgRawPath() + path
      })
      this.loading(false)
      return
    }
    // const url = e.detail.url.replace('https://api.github.com/repos/', '')
    apis.getBlob(e.detail.path).then((res) => {
    // apis.getBlob(url).then((res) => {
      this.parseFile(res, fileInfo)
    }).catch((err) => {
      if (err.code === 3) {
        this.setData({
          viewType: 'nosupport'
        })
      }
    })
  },
  parseFile (content, fileInfo, cb) {
    let { type, languageType } = fileInfo
    let dataToUpdate = {}
    if (type === 'md') {
      const that = this
      app.globalUtils.wxParse('md', 'md', content, that, 5, apis.getImgRawPath())
    } else if (type === 'language') {
      try {
        const codeRows = hightlight(content, languageType)
        dataToUpdate = {
          codeRows: codeRows
        }
      } catch (err) {
        console.log(err)
        this.toast('代码解析失败，将以纯文本展示')
        type = 'text'
        dataToUpdate = {
          viewText: content
        }
      }
    } else if (type === 'text') {
      dataToUpdate = {
        viewText: content
      }
    }
    this.setData(Object.assign({
      viewType: type
    }, dataToUpdate))
    this.loading(false)
    cb && cb()
  },
  imgOnLoad (e) {
    const ratio = parseFloat(e.detail.height) / parseFloat(e.detail.width)
    this.setData({
      imgStyle: `width:700rpx;height:${650 * ratio}rpx;`
    })
  },
  preViewImg (e) {
    console.log(e)
    wx.previewImage({
      urls: [e.target.dataset.src]
    })
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
// function getReadme (tree) {
//   for (let i = 0; i < tree.length; i++) {
//     if (tree[i].content && /^(readme|README)\.md$/.test(tree[i].content.path)) {
//       return tree[i].content
//     }
//   }
// }
const languageMap = {
  'js': 'javascript',
  'css': 'css',
  'html': 'html',
  'vue': 'markup',
  'ts': 'typescript',
  'json': 'json'
}
const imgMap = ['png', 'jpeg', 'jpg', 'gif']
function getFileInfo (path) {
  const fileInfo = {
    path
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
