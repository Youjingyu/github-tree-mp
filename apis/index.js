"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parseTree_1 = __importDefault(require("../utils/parseTree"));
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
    searchRepo(query, page, per_page) {
        return request(`${apiServer}search/repositories?q=${query}&page=${page}&per_page=${per_page}`);
    }
    getReopInfo() {
        return request(`${this.reposUrl.replace(/\/$/, '')}`);
    }
    getBranches() {
        return request(`${this.reposUrl}branches`);
    }
    // https://api.github.com/repos/Youjingyu/vue-hap-tools/contents/.eslintignore
    getBlob(path) {
        // return request(`${this.baseUrl}contents/${path}?ref=${this.branch}`).then((res) => {
        // return request(`${this.baseUrl}${path}`)
        return request(`${this.getRawPath()}${path}`, false);
    }
    getTree() {
        return request(`${this.reposUrl}git/trees/${this.branch}?recursive=1`).then((res) => {
            return parseTree_1.default(res.tree);
        });
    }
}
exports.default = new Apis();
let reqNum = 0;
function request(url, isJson = true) {
    return new Promise((resolve, reject) => {
        if (reqNum > 200)
            return reject({ code: 1, message: 'API rate limit exceeded.' });
        wx.request({
            url,
            dataType: isJson ? 'json' : 'text',
            success: function (res) {
                if (!res) {
                    return reject({
                        msg: 'unknown error',
                        code: 5
                    });
                }
                const { data, statusCode, header } = res;
                reqNum++;
                if (statusCode === 403) {
                    return reject({
                        msg: 'max call exceed',
                        code: 1
                    });
                }
                if (statusCode !== 200) {
                    return reject({
                        msg: 'no data received',
                        code: 2
                    });
                }
                if (!/^(application\/json|text\/plain)/.test(header['Content-Type'])) {
                    return reject({
                        msg: 'nosupport file type',
                        code: 3
                    });
                }
                res && resolve(data);
            },
            fail: function (err) {
                reject({
                    msg: err.message,
                    code: 4
                });
            }
        });
        // resolve({
        //   content: 'Ly8gaHR0cHM6Ly9lc2xpbnQub3JnL2RvY3MvdXNlci1ndWlkZS9jb25maWd1\ncmluZwoKbW9kdWxlLmV4cG9ydHMgPSB7CiAgcm9vdDogdHJ1ZSwKICBwYXJz\nZXJPcHRpb25zOiB7CiAgICBwYXJzZXI6ICdiYWJlbC1lc2xpbnQnCiAgfSwK\nICBlbnY6IHsKICAgIGJyb3dzZXI6IHRydWUsCiAgfSwKICBleHRlbmRzOiBb\nCiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vc3RhbmRhcmQvc3RhbmRhcmQv\nYmxvYi9tYXN0ZXIvZG9jcy9SVUxFUy1lbi5tZAogICAgJ3N0YW5kYXJkJwog\nIF0sCiAgLy8gYWRkIHlvdXIgY3VzdG9tIHJ1bGVzIGhlcmUKICBydWxlczog\newogICAgLy8gYWxsb3cgYXN5bmMtYXdhaXQKICAgICdnZW5lcmF0b3Itc3Rh\nci1zcGFjaW5nJzogJ29mZicsCiAgICAvLyBhbGxvdyBkZWJ1Z2dlciBkdXJp\nbmcgZGV2ZWxvcG1lbnQKICAgICduby1kZWJ1Z2dlcic6IHByb2Nlc3MuZW52\nLk5PREVfRU5WID09PSAncHJvZHVjdGlvbicgPyAnZXJyb3InIDogJ29mZics\nCiAgICAic2VtaSI6IDAsCiAgICAib25lLXZhciI6IDAKICB9Cn0K'
        // })
    });
}
