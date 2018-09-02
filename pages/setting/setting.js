/* global Page, wx */
import { cacheConfig } from '../../apis/cache'

Page({
  data: {
    openReadme: false,
    cacheTimes: ['1小时', '12小时', '1天'],
    cacheTime: 2
  },
  onReady () {
    const cacheTime = getStorage('cacheTime') || 24
    const openReadme = getStorage('openReadme') || 0
    this.setData({
      openReadme,
      cacheTime: Math.floor(cacheTime / 11)
    })
  },
  toast (toastText, duration = 1500) {
    wx.showToast({
      icon: 'none',
      title: toastText,
      duration
    })
  },
  changeCache (e) {
    const value = e.detail.value
    this.setData({
      cacheTime: value
    })
    setStorage('cacheTime', value === 0 ? 1 : value * 12)
    this.toast('重启生效')
  },
  changeOpenReadme () {
    const openReadme = !this.data.openReadme
    this.setData({
      openReadme: openReadme
    })
    this.toast('已切换')
    setStorage('openReadme', openReadme ? 1 : 0)
  },
  clearCache () {
    Object.keys(cacheConfig).forEach(key => {
      try {
        wx.removeStorageSync(cacheConfig[key].key)
      } catch (err) {
        console.log(err)
      }
    })
    this.toast('缓存已清除')
  },
  feedback () {
    const that = this
    wx.setClipboardData({
      data: 'https://github.com/Youjingyu/github-tree-mp',
      success: function (res) {
        that.toast('反馈链接已复制到剪贴板', 2000)
      }
    })
  }
})

function getStorage (key) {
  let res
  try {
    res = wx.getStorageSync(key)
  } catch (err) {
    console.log(err)
  }
  return res
}
function setStorage (key, val) {
  let res
  try {
    res = wx.setStorageSync(key, val)
  } catch (err) {
    console.log(err)
  }
  return res
}
