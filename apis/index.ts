import parseTree from '../utils/parseTree'

interface githubApiRes {
  content: string,
  tree: Array<TreeApiItem>
}

// const apiServer = 'https://www.whaleyou.club/'
// const apiServer = 'https://api.github.com/'
const apiServer = 'https://github.whaleyou.club/'

class Apis {
  public baseUrl = apiServer + 'repos/'
  public reposUrl = ''
  public reposPath = ''
  public sha = '34709373e6157be33748b58344969c318bec9fc1'
  public branch = 'master'
  public setResp (githubUrl:string) {
    this.reposPath = githubUrl.replace('https://github.com/', '').replace(/\/$/,  '')
    this.reposUrl = this.baseUrl + this.reposPath + '/'
  }
  public setBranch (branch:string) {
    this.branch = branch
  }
  public getImgRawPath () {
    return 'https://raw.githubusercontent.com/' + this.reposPath + '/' + this.branch + '/'
  }
  public getRawPath () {
    return apiServer + 'myraw/' + this.reposPath + '/' + this.branch + '/'
  }
  public searchRepo (query:string, page:string, per_page:string):Promise<object> {
    return request(`${apiServer}search/repositories?q=${query}&page=${page}&per_page=${per_page}`)
  }
  public getReopInfo ():Promise<object> {
    return request(`${this.reposUrl.replace(/\/$/, '')}`)
  }
  public getBranches ():Promise<object> {
    return request(`${this.reposUrl}branches`)
  }
  // https://api.github.com/repos/Youjingyu/vue-hap-tools/contents/.eslintignore
  public getBlob (path:string):Promise<object> {
    // return request(`${this.baseUrl}contents/${path}?ref=${this.branch}`).then((res) => {
    // return request(`${this.baseUrl}${path}`)
    return request(`${this.getRawPath()}${path}`, false)
  }
  public getTree ():Promise<object> {
    return request(`${this.reposUrl}git/trees/${this.branch}?recursive=1`).then((res) => {
      return parseTree(res.tree)
    })
  }
}

export default new Apis()

let reqNum = 0
setTimeout(() => {
  reqNum  = 0
}, 1000 * 60 * 60)
function request (url:string, isJson:boolean=true):Promise<githubApiRes>{
  return new Promise((resolve, reject) => {
    if (reqNum > 200) return reject({code: 1, message: '已超过最大请求次数，请稍后重试'})
    wx.request({
      url,
      dataType: isJson ? 'json': 'text',
      success: function(res) {
        if (!res) {
          return reject({
            message: '未知错误',
            code: 5
          })
        }
        const { data, statusCode, header} = res
        reqNum++
        if (statusCode === 403) {
          return reject({
            message: `服务器受到github请求次数限制，请稍后重试`,
            code: 1
          })
        }
        if (statusCode !== 200) {
          return reject({
            message: data.message,
            code: 2
          })
        }
        if (!/^(application\/json|text\/plain)/.test(header['Content-Type'])) {
          return reject({
            message: '不支持的文件类型',
            code: 3
          })
        }
        res && resolve(data)
      },
      fail: function(err:any){
        reject({
          message: err.message,
          code: 4
        })
      }
    })
    // resolve({
    //   content: 'Ly8gaHR0cHM6Ly9lc2xpbnQub3JnL2RvY3MvdXNlci1ndWlkZS9jb25maWd1\ncmluZwoKbW9kdWxlLmV4cG9ydHMgPSB7CiAgcm9vdDogdHJ1ZSwKICBwYXJz\nZXJPcHRpb25zOiB7CiAgICBwYXJzZXI6ICdiYWJlbC1lc2xpbnQnCiAgfSwK\nICBlbnY6IHsKICAgIGJyb3dzZXI6IHRydWUsCiAgfSwKICBleHRlbmRzOiBb\nCiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vc3RhbmRhcmQvc3RhbmRhcmQv\nYmxvYi9tYXN0ZXIvZG9jcy9SVUxFUy1lbi5tZAogICAgJ3N0YW5kYXJkJwog\nIF0sCiAgLy8gYWRkIHlvdXIgY3VzdG9tIHJ1bGVzIGhlcmUKICBydWxlczog\newogICAgLy8gYWxsb3cgYXN5bmMtYXdhaXQKICAgICdnZW5lcmF0b3Itc3Rh\nci1zcGFjaW5nJzogJ29mZicsCiAgICAvLyBhbGxvdyBkZWJ1Z2dlciBkdXJp\nbmcgZGV2ZWxvcG1lbnQKICAgICduby1kZWJ1Z2dlcic6IHByb2Nlc3MuZW52\nLk5PREVfRU5WID09PSAncHJvZHVjdGlvbicgPyAnZXJyb3InIDogJ29mZics\nCiAgICAic2VtaSI6IDAsCiAgICAib25lLXZhciI6IDAKICB9Cn0K'
    // })
  })
}