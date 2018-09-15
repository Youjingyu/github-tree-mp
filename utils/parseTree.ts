interface TreeItem {
  name: string,
  children?: Array<TreeItem>,
  content?: object
}
interface TreeObj {
  [propName: string]: any
}

// 判断目录树是否超过setData的上限
let treeSize = 0
let maxTreeSize = 1024 * 1000

function parseIntoObjTree(tree:Array<TreeApiItem>):TreeObj {
  const treeObj:TreeObj = {}
  tree.forEach((item) => {
    const pathArr = item.path.split('/')
    let curPathTree:any = treeObj
    pathArr.forEach((path, i) => {
      if (curPathTree[path]) {
        return curPathTree = curPathTree[path]
      }
      if (i < pathArr.length - 1 || item.type === 'tree') {
        curPathTree[path] = {}
        curPathTree = curPathTree[path]
      } else {
        curPathTree[path] = item
      }
    })
  })
  return treeObj
}

function objTreeToArray (treeObj:TreeObj, children:Array<TreeItem> = []) {
  sortTreeKey(treeObj).forEach((key: string) => {
    if (treeSize > maxTreeSize) return
    const treeItem:TreeItem = {
      name: key
    }
    treeSize += (key + 'name').length + 2
    const item = treeObj[key]
    if (item.type && item.mode) {
      treeSize += getSize(item) + ('content').length + 2
      // 只写入必要的数据，优化setData性能
      treeItem.content = {
        path: item.path,
        type: item.type,
        size: item.size
      }
    } else {
      treeSize += ('children').length + 2
      treeItem.children = []
      objTreeToArray(treeObj[key], treeItem.children)
    }
    if (treeSize > maxTreeSize) return
    children.push(treeItem)
  })
  return children
}

// 按照文件夹在前，文件在后的规则排序
function sortTreeKey (treeObj:TreeObj):Array<string> {
  const treeArr:Array<string> = []
  const fileArr:Array<string> = []
  Object.keys(treeObj).forEach((key) => {
    if (treeObj[key].type){
      fileArr.push(key)
    } else {
      treeArr.push(key)
    }
  })
  return treeArr.concat(fileArr)
}

function getSize (item:any) {
  let size = 0
  if (item.path)  {
    size += (item.path + 'path').length
  }
  if (item.type)  {
    size += (item.type + 'type').length
  }
  if (item.size)  {
    size += (item.size + 'size').length
  }
  return size
}

export default function (tree:Array<TreeApiItem>):Array<TreeItem> {
  treeSize = 0
  const objTree = parseIntoObjTree(tree)
  const res = objTreeToArray(objTree)
  return res
}