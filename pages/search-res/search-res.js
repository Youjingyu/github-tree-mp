import apis from '../../apis/index'

let query = ''
let page = 1
let perPage = 30

Page({
  data: {
    loading: true,
    list: [],
    loadMore: false,
    noData: false
  },
  onLoad (option) {
    page = 1
    query = option.query
    this.getList()
  },
  onReachBottom () {
    this.getList()
  },
  getList () {
    if (this.data.loadMore === true) return
    this.setData({
      loadMore: true
    })
    apis.searchRepo(query, page, perPage).then((res) => {
      this.setData({
        list: this.data.list.concat(filterData(res.items)),
        loadMore: false
      })
      if (this.data.list.length === 0) {
        this.setData({
          noData: true
        })
      }
      page++
    })
  },
  choose (e) {
    console.log(e)
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
