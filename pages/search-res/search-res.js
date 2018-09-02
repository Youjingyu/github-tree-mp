/* global Page, wx */
import apis from '../../apis/index'

let query = ''
let page = 1
let perPage = 30

Page({
  data: {
    loading: true,
    list: [],
    loadMore: false,
    noData: false,
    noMoreData: false
  },
  loading (show = true) {
    show ? wx.showLoading({
      title: '正在加载'
    }) : wx.hideLoading()
  },
  onLoad (option) {
    page = 1
    query = option.query
    this.loading()
    this.getList(() => {
      this.loading(false)
    })
  },
  onReachBottom () {
    if (this.data.loadMore === true || this.data.noMoreData) return
    this.setData({
      loadMore: true
    })
    this.getList(() => {
      this.setData({
        loadMore: false
      })
    })
  },
  getList (cb) {
    apis.searchRepo(query, page, perPage).then((res) => {
      this.setData({
        list: this.data.list.concat(filterData(res.items))
      })
      if (this.data.list.length === 0) {
        this.setData({
          noData: true
        })
      } else if (res.items.length === 0) {
        this.setData({
          noMoreData: true
        })
      }
      page++
      cb && cb()
    }).catch((error) => {
      let msg = error.message
      if (error.code === 1) {
        msg = '服务器受到github请求次数限制，请1分钟后重试'
      }
      this.loading(false)
      wx.showToast({
        icon: 'none',
        title: msg,
        duration: 2000
      })
    })
  },
  choose (e) {
    const { repos, star, forks, branch } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/index/index?repos=${repos}&star=${star}&forks=${forks}&branch=${branch}`
    })
  }
})

function filterData (data) {
  const res = []
  data.forEach(item => {
    const star = item.stargazers_count
    res.push({
      full_name: item.full_name,
      description: item.description,
      html_url: item.html_url,
      // updated_at: item.updated_at.replace(/T.*/, ''),
      language: item.language || '',
      stargazers_count: star > 999 ? ((star / 1000).toFixed(1) + 'k') : star,
      login: item.owner.login,
      avatar_url: item.owner.avatar_url,
      forks_count: item.forks_count,
      default_branch: item.default_branch,
      langColor: getLanguageColor(item.language)
    })
  })
  return res
}

function getLanguageColor (lang) {
  const languageColorMap = {
    'C': '555',
    'C++': 'f34b7d',
    'CSS': '563d7c',
    'Dart': '00b4ab',
    'Go': '375eab',
    'HTML': 'e34c26',
    'Java': 'b07219',
    'JavaScript': 'f1e05a',
    'Object-C': '438eff',
    'PHP': '4f5d95',
    'Python': '3572a5',
    'TypeScript': '2b7489',
    'Vue': '0298c3',
    'default': 'db901e'
  }
  return '#' + (languageColorMap[lang] || languageColorMap.default)
}
