Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    data: {
      type: Array,
      value: []
    },
    treeData: {
      type: Array,
      value: []
    }
  },
  data: {
  },
  ready () {
  },
  methods: {
    // 这里是一个自定义方法
    onClick (e) {
      const treeData = this.data.treeData
      const index = e.currentTarget.dataset['index']
      treeData[index].expand = !treeData[index].expand
      this.setData({
        treeData
      })
      const data = this.data.data
      console.log(data[index].content)
      if (data[index].content && data[index].content.type === 'blob') {
        this.triggerEvent('viewFile', { url: data[index].content.url })
      }
    }
  }
})
