"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../utils/index"));
const parseTree_1 = __importDefault(require("../utils/parseTree"));
class Apis {
    constructor() {
        this.baseUrl = 'https://www.whaleyou.club/repos/';
        // public baseUrl = 'https://api.github.com/repos/'
        this.reposUrl = '';
        this.sha = '34709373e6157be33748b58344969c318bec9fc1';
        this.branch = 'master';
    }
    setResp(githubUrl, branch = 'master') {
        this.reposUrl = this.baseUrl + githubUrl.replace('https://github.com/', '');
        return this.baseUrl;
    }
    // https://api.github.com/repos/Youjingyu/vue-hap-tools/contents/.eslintignore
    getBlob(path) {
        // return request(`${this.baseUrl}contents/${path}?ref=${this.branch}`).then((res) => {
        return request(`${this.baseUrl}${path}`).then((res) => {
            return index_1.default.globalUtils.base64.decode(res.content);
        });
    }
    getTree() {
        return request(`${this.reposUrl}git/trees/${this.branch}?recursive=1`).then((res) => {
            return parseTree_1.default(res.tree);
        });
    }
}
exports.default = new Apis();
let reqNum = 0;
function request(url) {
    return new Promise((resolve, reject) => {
        if (reqNum > 200)
            return reject({ code: 1, message: 'API rate limit exceeded.' });
        wx.request({
            url,
            dataType: 'json',
            success: function (res) {
                if (res) {
                    reqNum++;
                    resolve(res.data);
                }
                else {
                    reject(new Error('no data received'));
                }
            },
            fail: function (err) {
                reject(err);
            }
        });
        // resolve({
        //   content: 'Ly8gaHR0cHM6Ly9lc2xpbnQub3JnL2RvY3MvdXNlci1ndWlkZS9jb25maWd1\ncmluZwoKbW9kdWxlLmV4cG9ydHMgPSB7CiAgcm9vdDogdHJ1ZSwKICBwYXJz\nZXJPcHRpb25zOiB7CiAgICBwYXJzZXI6ICdiYWJlbC1lc2xpbnQnCiAgfSwK\nICBlbnY6IHsKICAgIGJyb3dzZXI6IHRydWUsCiAgfSwKICBleHRlbmRzOiBb\nCiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vc3RhbmRhcmQvc3RhbmRhcmQv\nYmxvYi9tYXN0ZXIvZG9jcy9SVUxFUy1lbi5tZAogICAgJ3N0YW5kYXJkJwog\nIF0sCiAgLy8gYWRkIHlvdXIgY3VzdG9tIHJ1bGVzIGhlcmUKICBydWxlczog\newogICAgLy8gYWxsb3cgYXN5bmMtYXdhaXQKICAgICdnZW5lcmF0b3Itc3Rh\nci1zcGFjaW5nJzogJ29mZicsCiAgICAvLyBhbGxvdyBkZWJ1Z2dlciBkdXJp\nbmcgZGV2ZWxvcG1lbnQKICAgICduby1kZWJ1Z2dlcic6IHByb2Nlc3MuZW52\nLk5PREVfRU5WID09PSAncHJvZHVjdGlvbicgPyAnZXJyb3InIDogJ29mZics\nCiAgICAic2VtaSI6IDAsCiAgICAib25lLXZhciI6IDAKICB9Cn0K'
        // })
    });
}
