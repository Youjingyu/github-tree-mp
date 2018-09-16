"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cache_1 = require("./cache");
// const apiServer = 'https://www.whaleyou.club/'
// const apiServer = 'https://api.github.com/'
const apiServer = 'https://github.whaleyou.club/';
class Apis {
    constructor() {
        this.baseUrl = apiServer + 'repos/';
        this.reposUrl = '';
        this.reposPath = '';
        this.sha = '34709373e6157be33748b58344969c318bec9fc1';
        this.branch = 'master';
    }
    setResp(githubUrl) {
        this.reposPath = githubUrl.replace('https://github.com/', '').replace(/\/$/, '');
        this.reposUrl = this.baseUrl + this.reposPath + '/';
    }
    setBranch(branch) {
        this.branch = branch;
    }
    getImgRawPath() {
        return 'https://raw.githubusercontent.com/' + this.reposPath + '/' + this.branch + '/';
    }
    getRawPath() {
        return apiServer + 'myraw/' + this.reposPath + '/' + this.branch + '/';
    }
    getRawPathNoBranch() {
        return apiServer + 'myraw/' + this.reposPath + '/';
    }
    searchRepo(query, page, per_page) {
        const url = `${apiServer}search/repositories?q=${query}&page=${page}&per_page=${per_page}`;
        return requestWithCache(url, cache_1.cacheConfig.search);
    }
    getReopInfo() {
        const url = `${this.reposUrl.replace(/\/$/, '')}`;
        return requestWithCache(url, cache_1.cacheConfig.reposInfo);
    }
    getBranches() {
        const url = `${this.reposUrl}branches`;
        return requestWithCache(url, cache_1.cacheConfig.reposBranch);
    }
    // https://api.github.com/repos/Youjingyu/vue-hap-tools/contents/.eslintignore
    getBlob(path, noBranch) {
        // return request(`${this.baseUrl}contents/${path}?ref=${this.branch}`).then((res) => {
        // return request(`${this.baseUrl}${path}`)
        let url = `${this.getRawPath()}${path}`;
        if (noBranch) {
            url = `${this.getRawPathNoBranch()}${path}`;
        }
        const cacheConf = cache_1.cacheConfig.raw;
        const cacheData = cache_1.getCache(url, cacheConf);
        return new Promise((resolve, reject) => {
            if (cacheData)
                return resolve(cacheData);
            request(url, false).then((res) => {
                const { length, data } = res;
                // 只缓存30kb以下的文件
                if (length < 1024 * 30) {
                    cache_1.setCache(url, data, cacheConf);
                }
                resolve(data);
            }).catch(reject);
        });
    }
    getTree() {
        const url = `${this.reposUrl}git/trees/${this.branch}?recursive=1`;
        return requestWithCache(url, cache_1.cacheConfig.reposTree).then((res) => {
            return res.tree;
        });
    }
}
exports.default = new Apis();
let reqNum = 0;
setTimeout(() => {
    reqNum = 0;
}, 1000 * 60 * 60);
function request(url, isJson = true) {
    return new Promise((resolve, reject) => {
        if (reqNum > 200)
            return reject({ code: 1, message: '已超过最大请求次数，请稍后重试' });
        wx.request({
            url,
            dataType: 'text',
            success: function (res) {
                if (!res) {
                    return reject({
                        message: '未知错误',
                        code: 5
                    });
                }
                let { data, statusCode, header } = res;
                const length = data.length;
                if (isJson) {
                    data = JSON.parse(data);
                }
                reqNum++;
                if (statusCode === 403) {
                    return reject({
                        message: `服务器受到github请求次数限制，请稍后重试`,
                        code: 1
                    });
                }
                if (statusCode !== 200) {
                    return reject({
                        message: data.message,
                        code: 2
                    });
                }
                if (!/^(application\/json|text\/plain)/.test(header['Content-Type'])) {
                    return reject({
                        message: '不支持的文件类型',
                        code: 3
                    });
                }
                res && resolve({
                    data,
                    length
                });
            },
            fail: function (err) {
                reject({
                    message: err.message,
                    code: 4
                });
            }
        });
        // resolve({
        //   content: 'Ly8gaHR0cHM6Ly9lc2xpbnQub3JnL2RvY3MvdXNlci1ndWlkZS9jb25maWd1\ncmluZwoKbW9kdWxlLmV4cG9ydHMgPSB7CiAgcm9vdDogdHJ1ZSwKICBwYXJz\nZXJPcHRpb25zOiB7CiAgICBwYXJzZXI6ICdiYWJlbC1lc2xpbnQnCiAgfSwK\nICBlbnY6IHsKICAgIGJyb3dzZXI6IHRydWUsCiAgfSwKICBleHRlbmRzOiBb\nCiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vc3RhbmRhcmQvc3RhbmRhcmQv\nYmxvYi9tYXN0ZXIvZG9jcy9SVUxFUy1lbi5tZAogICAgJ3N0YW5kYXJkJwog\nIF0sCiAgLy8gYWRkIHlvdXIgY3VzdG9tIHJ1bGVzIGhlcmUKICBydWxlczog\newogICAgLy8gYWxsb3cgYXN5bmMtYXdhaXQKICAgICdnZW5lcmF0b3Itc3Rh\nci1zcGFjaW5nJzogJ29mZicsCiAgICAvLyBhbGxvdyBkZWJ1Z2dlciBkdXJp\nbmcgZGV2ZWxvcG1lbnQKICAgICduby1kZWJ1Z2dlcic6IHByb2Nlc3MuZW52\nLk5PREVfRU5WID09PSAncHJvZHVjdGlvbicgPyAnZXJyb3InIDogJ29mZics\nCiAgICAic2VtaSI6IDAsCiAgICAib25lLXZhciI6IDAKICB9Cn0K'
        // })
    });
}
function requestWithCache(url, cacheConf) {
    const cache = cache_1.getCache(url, cacheConf);
    return new Promise((resolve, reject) => {
        if (cache)
            return resolve(cache);
        request(url).then((res) => {
            const { length, data } = res;
            // 只缓存500kb以下的接口
            if (length < 500 * 1024) {
                cache_1.setCache(url, data, cacheConf);
            }
            resolve(data);
        }).catch(reject);
    });
}
