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
    wx.navigateTo({
      url: '/pages/index/index?repos=' + e.currentTarget.dataset.repos
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
      stargazers_count: star > 999 ? ((star / 1000).toFixed(1) + 'k') : star
    })
  })
  return res
}
