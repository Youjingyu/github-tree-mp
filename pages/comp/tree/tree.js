Component({
  properties: {
    model: Object,
  },
  data: {
    open: false
  },
  ready () {
  },
  methods: {
    // 这里是一个自定义方法
    toggle (e) {
      this.setData({
        open: !this.data.open
      })
      const data = this.data.model
      if (data.content && data.content.type === 'blob') {
        this.triggerEvent('viewFile', {
          url: data.content.url,
          path: data.content.path
        })
      }
    }
  }
})
