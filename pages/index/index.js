"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../../apis/index"));
const index_2 = __importDefault(require("../../utils/index"));
index_1.default.setResp('https://github.com/Youjingyu/vue-hap-tools/');
class IndexPage {
    constructor() {
        this.data = {
            code: {
                nodes: []
            },
            codeRows: [],
            loadCodeError: false
        };
    }
    onLoad() {
        index_1.default.getBlob('/bin/vue-hap.js').then((codeString) => {
            let html = index_2.default.globalUtils.hightlight.highlight('javascript', codeString).value;
            let codeSegments = html.split(/\n/);
            const codeRows = [];
            codeSegments.forEach((segment) => {
                const res = [];
                const spaces = segment.match(/^(\s+)</);
                if (spaces) {
                    res.push({
                        text: spaces[1]
                    });
                }
                const htmlJson = index_2.default.globalUtils.html2json(segment);
                htmlJson.nodes.forEach((node) => {
                    if (node.node === 'text') {
                        res.push({
                            text: node.text
                        });
                    }
                    else if (node.node === 'element') {
                        res.push({
                            class: node.classStr,
                            text: node.nodes[0].text
                        });
                    }
                });
                codeRows.push(res);
            });
            this.setData({
                codeRows: codeRows
            });
            // app.globalUtils.wxParse('code', 'html', html, this, 5)
        }).catch(() => {
            this.data.loadCodeError = true;
        });
    }
}
Page(new IndexPage());
