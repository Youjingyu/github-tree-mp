/* global Page, wx */
import apis from '../../apis/index'
import parseTree from '../../utils/parseTree'

const hightlight = require('../../utils/prism/index')
const { languageMap } = require('../../utils/prism/language')
const marked = require('../../utils/marked/index')

// let codeRowsCache = []
// let allowRender = true
let openReadme = false

Page({
  data: {
    md: {
      nodes: []
    },
    codeRows: [],
    markdownNodes: [],
    treeData: [],
    reposPath: '',
    filePath: '',
    branches: [],
    curBranch: '',
    viewType: 'md',
    viewText: '',
    viewImgSrc: '',
    stargazers_count: '',
    forks: '',
    imgStyle: '',
    showSidebar: false,
    query: {},
    scrollTop: 0
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
  onShareAppMessage () {
    const query = this.data.query
    query.filePath = this.data.filePath
    const queryString = Object.keys(query).map((key) => {
      return key + '=' + query[key]
    }).join('&')
    return {
      path: `/pages/index/index?${queryString}`
    }
  },
  onReady () {
    wx.showShareMenu({
      withShareTicket: true
    })
  },
  onLoad (option) {
    this.setData({
      query: option
    })
    option = decodeOption(option)
    try {
      openReadme = wx.getStorageSync('openReadme')
    } catch (err) {
      console.log(err)
    }
    this.loading()
    const { repos } = option
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
      reposPath: reposPath
    })
    const { star, forks, branch, filePath } = option
    if (filePath) {
      this.setData({
        filePath: filePath
      })
    }
    if (branch) {
      this.setData({
        stargazers_count: star,
        forks: forks
      })
      this.changeBranch(branch)
    } else {
      this.proxyApi('getReopInfo').then((res) => {
        this.setData({
          stargazers_count: res.stargazers_count,
          forks: res.forks
        })
        return this.changeBranch(res.default_branch)
      })
    }
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
  toggleMenu () {
    if (this.data.showSidebar) {
      this.hideMenu()
    } else {
      this.showMenu()
    }
  },
  showMenu () {
    this.setData({
      showSidebar: true
    })
  },
  hideMenu () {
    this.setData({
      showSidebar: false
    })
  },
  clickCodeView () {
    this.hideMenu()
  },
  changeBranch (branch) {
    apis.setBranch(branch)
    this.loading()
    return this.proxyApi('getTree').then((tree) => {
      const parsedTree = parseTree(tree)
      this.setData({
        curBranch: branch,
        treeData: parsedTree.tree
      })
      if (this.data.filePath !== '') {
        this.viewFile({
          detail: {
            path: this.data.filePath
          }
        })
      } else if (openReadme) {
        const readme = getReadme(parsedTree.tree)
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
      if (parsedTree.exceed) {
        this.toast('目录树过大，只进行部分渲染')
      }
      console.log(this.data.treeData)
    })
  },
  branchPickerChange (e) {
    this.changeBranch(this.data.branches[e.detail.value])
  },
  viewFile (e) {
    let { path, size = 0, noBranch = false } = e.detail
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
      this.doViewFile(path, fileInfo, noBranch)
    }
  },
  doViewFile (path, fileInfo, noBranch) {
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
    this.proxyApi('getBlob', [path, noBranch]).then((res) => {
      this.parseFile(res, fileInfo)
    })
  },
  parseFile (content, fileInfo, cb) {
    let { type, languageRender } = fileInfo
    let dataToUpdate = {}
    try {
      if (type === 'md') {
        dataToUpdate = {
          markdownNodes: marked(content, apis.getImgRawPath())
        }
      } else if (type === 'language') {
        let codeRowsCache = hightlight(content, languageRender)
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
      } else if (type === 'text') {
        dataToUpdate = {
          viewText: content
        }
      }
    } catch (err) {
      console.log(err)
      this.toast('代码解析失败，将以纯文本展示')
      type = 'text'
      dataToUpdate = {
        viewText: content
      }
    }
    this.setData(Object.assign({
      viewType: type,
      scrollTop: 0
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
  mdtap (e) {
    const href = e.target.dataset.href
    if (href !== undefined && href !== '') {
      const that = this
      const filePath = getHrefPath(href, that.data.reposPath, that.data.curBranch)
      if (filePath) {
        this.viewFile({
          detail: {path: filePath, size: 1, noBranch: true}
        })
      } else {
        wx.setClipboardData({
          data: href,
          success: function (res) {
            that.toast && that.toast('链接已复制到剪贴板', 1000)
          }
        })
      }
    }
  },
  preViewImg (e) {
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
    fileInfo.languageRender = languageMap[type].render
  } else {
    fileInfo.type = 'text'
  }
  return fileInfo
}

function getHrefPath (href, reposPath, branch) {
  if (!/^http(s)?:\/\//.test(href) && !/\.com/.test(href)) {
    return 'branch' + href
  }
  href = href.replace('https://github.com/', '')
  const reg = new RegExp('^' + reposPath + '/blob/(.+)')
  const matches = href.match(reg)
  if (matches) {
    return matches[1]
  }
}
function decodeOption (option) {
  Object.keys(option).forEach((key) => {
    option[key] = decodeURIComponent(option[key])
  })
  return option
}
