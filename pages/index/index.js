/* global Page, wx */
import apis from '../../apis/index'
import app from '../../utils/index'

const hightlight = app.globalUtils.hightlight
// let codeRowsCache = []
// let allowRender = true
let openReadme = false

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
    imgStyle: '',
    showSidebarBack: false
  },
  proxyApi (method, arg = []) {
    const that = this
    return new Promise((resolve, reject) => {
      apis[method].apply(apis, arg)
        .then(resolve)
        .catch((error) => {
          that.loading(false)
          that.toast(error.message, 2000)
          reject(error)
        })
    })
  },
  toast (toastText, duration = 1500) {
    wx.showToast({
      icon: 'none',
      title: toastText,
      duration
    })
  },
  loading (show = true) {
    show ? wx.showLoading({
      title: '正在加载'
    }) : wx.hideLoading()
  },
  onLoad (option) {
    try {
      openReadme = wx.getStorageSync('openReadme')
    } catch (err) {
      console.log(err)
    }
    this.loading()
    this.createAnimation()
    const repos = option.repos
    // const repos = 'https://github.com/Youjingyu/vue-hap-tools'
    // const repos = 'https://github.com/vuejs/vue'
    apis.setResp(repos)
    const reposPath = repos.replace('https://github.com/', '').replace(/\/$/, '')
    wx.getStorage({
      key: 'history',
      success: function (res) {
        let history = res.data
        const index = history.indexOf(reposPath)
        if (index < 0) {
          history.unshift(reposPath)
        } else if (index > 0) {
          history.splice(index, 1)
          history.unshift(reposPath)
        }
        if (history.length > 10) {
          history.splice(10, 1)
        }
        wx.setStorageSync('history', history)
      },
      fail: function () {
        wx.setStorageSync('history', [reposPath])
      }
    })
    this.setData({
      reposPath: reposPath,
      filePath: reposPath
    })
    this.proxyApi('getReopInfo').then((res) => {
      this.setData({
        stargazers_count: res.stargazers_count,
        forks: res.forks
      })
      return this.changeBranch(res.default_branch)
    })
    this.proxyApi('getBranches').then((res) => {
      // github按照创建时间倒序返回branches
      // 这里按照时间从旧到新显示
      const branch = res.reverse().map((item) => {
        return item.name
      })
      this.setData({
        branches: branch
      })
    })
  },
  createAnimation () {
    const animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease'
    })
    this.animation = animation
    this.setData({
      animationData: this.animation.export()
    })
  },
  toggleMenu () {
    if (this.data.showSidebarBack) {
      this.hideMenu()
    } else {
      this.showMenu()
    }
  },
  showMenu () {
    this.animation.left('0rpx').step()
    this.setData({
      animationData: this.animation.export(),
      showSidebarBack: true
    })
  },
  hideMenu () {
    this.animation.left('-600rpx').step()
    this.setData({
      animationData: this.animation.export(),
      showSidebarBack: false
    })
  },
  clickCodeView () {
    this.hideMenu()
  },
  changeBranch (branch) {
    apis.setBranch(branch)
    this.loading()
    return this.proxyApi('getTree').then((tree) => {
      this.setData({
        curBranch: branch,
        treeData: tree,
        loading: false
      })
      if (openReadme) {
        const readme = getReadme(tree)
        console.log(readme)
        if (!readme) {
          this.loading(false)
          this.showMenu()
        } else {
          this.viewFile({
            detail: {
              path: readme.path,
              size: readme.size
            }
          })
        }
      } else {
        this.loading(false)
        this.showMenu()
      }
      console.log(this.data.treeData)
    })
  },
  branchPickerChange (e) {
    this.changeBranch(this.data.branches[e.detail.value])
  },
  viewFile (e) {
    let { path, size } = e.detail
    const fileInfo = getFileInfo(path)
    size = (size / 1024).toFixed(2)
    if (size > 512 || (fileInfo.type === 'language' && size > 50)) {
      const that = this
      wx.showModal({
        content: `文件过大（${size}kb），可能造成手机卡顿，是否查看？`,
        success: function (res) {
          if (res.confirm) {
            that.doViewFile(path, fileInfo)
          }
        }
      })
    } else {
      this.doViewFile(path, fileInfo)
    }
  },
  doViewFile (path, fileInfo) {
    this.loading()
    this.setData({
      filePath: path
    })
    this.hideMenu()
    if (fileInfo.type === 'img') {
      this.setData({
        viewType: fileInfo.type,
        viewImgSrc: apis.getImgRawPath() + path
      })
      this.loading(false)
      return
    }
    this.proxyApi('getBlob', [path]).then((res) => {
      this.parseFile(res, fileInfo)
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
        let codeRowsCache = hightlight(content, languageType)
        dataToUpdate = {
          // 初始时，只显示150行
          codeRows: codeRowsCache.slice(0, 150)
        }
        // 延迟渲染，避免卡顿
        setTimeout(() => {
          this.setData({
            codeRows: codeRowsCache
          })
        }, 1500)
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
  scrollBottom (e) {
    // if (allowRender && e.detail.direction === 'bottom' && codeRowsCache.length > 0) {
    //   allowRender = false
    //   this.toast('努力渲染代码中...')
    //   this.setData({
    //     // 一次渲染100行
    //     codeRows: this.data.codeRows.concat(codeRowsCache.splice(0, 100))
    //   })
    //   setTimeout(() => {
    //     allowRender = true
    //   }, 1000)
    // }
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
  'wxss': 'css',
  'html': 'markup',
  'wxml': 'markup',
  'vue': 'markup',
  'jsx': 'markup',
  'tsx': 'typescript',
  'ts': 'typescript',
  'json': 'json',
  'dart': 'dart',
  'go': 'go',
  'less': 'less',
  'scss': 'sass',
  'java': 'java',
  'py': 'python',
  'php': 'php',
  'kt': 'kotlin',
  'swift': 'swift',
  'c': 'c',
  'h': 'c',
  'm': 'c',
  'cpp': 'clike',
  'cs': 'clike',
  'sh': 'bash'
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
