interface TreeItem {
  name: string,
  children?: Array<TreeItem>,
  content?: object
}
interface TreeObj {
  [propName: string]: TreeObj
}

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
    const treeItem:TreeItem = {
      name: key
    }
    const item = treeObj[key]
    if (item.type) {
      // 只写入必要的数据，优化setData性能
      treeItem.content ={
        path: item.path,
        type: item.type,
        size: item.size
      }
    } else {
      treeItem.children = []
      objTreeToArray(treeObj[key], treeItem.children)
    }
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

export default function (tree:Array<TreeApiItem>):Array<TreeItem> {
  const objTree = parseIntoObjTree(tree)
  return objTreeToArray(objTree)
}