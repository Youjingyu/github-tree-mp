"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hour = 1000 * 60 * 60;
let catchTime = 24;
try {
    catchTime = wx.getStorageSync('cacheTime') || 24;
}
catch (err) {
    console.log(err);
}
let cacheHour = catchTime * hour;
const cacheConfig = {
    search: {
        size: 30,
        time: cacheHour,
        key: '_search'
    },
    reposInfo: {
        size: 30,
        time: cacheHour,
        key: '_repos_info'
    },
    reposTree: {
        size: 30,
        time: cacheHour,
        key: '_repos_tree'
    },
    reposBranch: {
        size: 30,
        time: cacheHour,
        key: '_repos_branch'
    },
    raw: {
        size: 20,
        time: cacheHour,
        key: '_raw'
    }
};
exports.cacheConfig = cacheConfig;
// 删除过期缓存
for (let key in cacheConfig) {
    const conf = cacheConfig[key];
    try {
        let data = wx.getStorageSync(conf.key) || [];
        let indexToDelete = [];
        data.forEach((item, i) => {
            if (Date.now() - item.time > conf.time) {
                indexToDelete.push(i);
            }
        });
        data = data.filter((item, i) => {
            return indexToDelete.indexOf(i) < 0;
        });
        wx.setStorageSync(conf.key, data);
    }
    catch (e) {
        console.log(e);
    }
}
function getCache(url, conf) {
    let data = null;
    try {
        let keyData = wx.getStorageSync(conf.key) || [];
        let index = keyData.findIndex((item) => {
            return item.url === url;
        });
        if (index >= 0) {
            data = keyData[index].data;
            if (Date.now() - data.time > conf.time) {
                data = null;
                keyData.splice(index, 1);
                wx.setStorageSync(conf.key, keyData);
            }
        }
    }
    catch (e) {
        console.log(e);
    }
    return data;
}
exports.getCache = getCache;
function setCache(url, data, conf) {
    let keyData = [];
    try {
        keyData = wx.getStorageSync(conf.key) || [];
    }
    catch (e) {
        console.log(e);
    }
    try {
        keyData.unshift({
            time: Date.now(),
            url,
            data
        });
        if (keyData.length > conf.size) {
            keyData.splice(-1, 1);
        }
        wx.setStorageSync(conf.key, keyData);
    }
    catch (e) {
        console.log(e);
    }
}
exports.setCache = setCache;
