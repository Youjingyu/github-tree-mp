"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parseIntoObjTree(tree) {
    const treeObj = {};
    tree.forEach((item) => {
        const pathArr = item.path.split('/');
        let curPathTree = treeObj;
        pathArr.forEach((path, i) => {
            if (curPathTree[path]) {
                return curPathTree = curPathTree[path];
            }
            if (i < pathArr.length - 1 || item.type === 'tree') {
                curPathTree[path] = {};
                curPathTree = curPathTree[path];
            }
            else {
                curPathTree[path] = item;
            }
        });
    });
    return treeObj;
}
function objTreeToArray(treeObj, children = []) {
    sortTreeKey(treeObj).forEach((key) => {
        const treeItem = {
            name: key
        };
        if (treeObj[key].type) {
            treeItem.content = treeObj[key];
        }
        else {
            treeItem.children = [];
            objTreeToArray(treeObj[key], treeItem.children);
        }
        children.push(treeItem);
    });
    return children;
}
// 按照文件夹在前，文件在后的规则排序
function sortTreeKey(treeObj) {
    const treeArr = [];
    const fileArr = [];
    Object.keys(treeObj).forEach((key) => {
        if (treeObj[key].type) {
            fileArr.push(key);
        }
        else {
            treeArr.push(key);
        }
    });
    return treeArr.concat(fileArr);
}
function default_1(tree) {
    const objTree = parseIntoObjTree(tree);
    return objTreeToArray(objTree);
}
exports.default = default_1;
