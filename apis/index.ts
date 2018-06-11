import app from '../utils/index'

interface githubApiRes {
  content: string
}

class Apis {
  public baseUrl = 'https://api.github.com/repos'
  public sha = '34709373e6157be33748b58344969c318bec9fc1'
  public setResp (githubUrl:string, branch:string = 'master'):string {
    this.baseUrl = this.baseUrl + githubUrl.replace('https://github.com', '').replace(/\/$/, '')
    return this.baseUrl
  }
  // https://api.github.com/repos/Youjingyu/vue-hap-tools/contents/.eslintignore
  public getBlob (path:string):Promise<string> {
    return request(this.baseUrl + '/contents' + path.replace(/^\//, '')).then((res) => {
      return app.globalUtils.base64.decode(res.content)
    })
  }
}

export default new Apis()

function request (url:string):Promise<githubApiRes>{
  return new Promise((resolve, reject) => {
    // wx.request({
    //   url,
    //   dataType: 'json',
    //   success: function(res) {
    //     if (res) {
    //       resolve(res.data)
    //     } else {
    //       reject(new Error('no data received'))
    //     }
    //   },
    //   fail: function(){
    //     reject(new Error('request failed'))
    //   }
    // })
    resolve({
      content: 'IyEvdXNyL2Jpbi9lbnYgbm9kZQoKJ3VzZSBzdHJpY3QnCgpjb25zdCBjaGFs\nayA9IHJlcXVpcmUoJ2NoYWxrJyk7CmNvbnN0IHNlbXZlciA9IHJlcXVpcmUo\nJ3NlbXZlcicpOwpjb25zdCBzcGF3biA9IHJlcXVpcmUoJ2Nyb3NzLXNwYXdu\nJyk7CmNvbnN0IHJlcXVpcmVkVmVyc2lvbiA9IHJlcXVpcmUoJy4uL3BhY2th\nZ2UuanNvbicpLmVuZ2luZXMubm9kZTsKY29uc3QgZnMgPSByZXF1aXJlKCdm\ncycpOwpjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpOwoKaWYgKCFzZW12\nZXIuc2F0aXNmaWVzKHByb2Nlc3MudmVyc2lvbiwgcmVxdWlyZWRWZXJzaW9u\nKSkgewogIGNvbnNvbGUubG9nKAogICAgY2hhbGsucmVkKAogICAgICBgWW91\nIGFyZSB1c2luZyBOb2RlICR7CiAgICAgICAgcHJvY2Vzcy52ZXJzaW9uCiAg\nICAgIH0sIGJ1dCB2dWUtY2xpLXNlcnZpY2UgcmVxdWlyZXMgTm9kZSAke3Jl\ncXVpcmVkVmVyc2lvbn0uXG5QbGVhc2UgdXBncmFkZSB5b3VyIE5vZGUgdmVy\nc2lvbi5cbmAKICAgICkKICApOwogIHByb2Nlc3MuZXhpdCgxKTsKfQoKY29u\nc3QgYXJncyA9IHByb2Nlc3MuYXJndi5zbGljZSgyKTsKCmNvbnN0IGFyZ01h\ncCA9IHsKICAnYnVpbGQnOiBbJ05PREVfUExBVEZPUk09bmEnLCAnTk9ERV9Q\nSEFTRT1kdicsICd3ZWJwYWNrJywgJy0tY29uZmlnJywgJy4vbm9kZV9tb2R1\nbGVzL3Z1ZS1oYXAtdG9vbHMvd2VicGFjay5jb25maWcuanMnXSwKICAncmVs\nZWFzZSc6IFsnTk9ERV9QTEFURk9STT1uYScsICdOT0RFX1BIQVNFPW9sJywg\nJ3dlYnBhY2snLCAnLS1jb25maWcnLCAnLi9ub2RlX21vZHVsZXMvdnVlLWhh\ncC10b29scy93ZWJwYWNrLmNvbmZpZy5qcyddLAogICdzZXJ2ZXInOiBbJ05P\nREVfTU9VTlRFRF9ST1VURVI9ImRlYnVnIGJ1bmRsZSInLCAnbm9kZScsICcu\nL25vZGVfbW9kdWxlcy92dWUtaGFwLXRvb2xzL2RlYnVnZ2VyL3NlcnZlci9p\nbmRleC5qcyddLAogICd3YXRjaCc6IFsnTk9ERV9QTEFURk9STT1uYScsICdO\nT0RFX1BIQVNFPWR2JywgJ3dlYnBhY2snLCAnLS1jb25maWcnLCAnLi9ub2Rl\nX21vZHVsZXMvdnVlLWhhcC10b29scy93ZWJwYWNrLmNvbmZpZy5qcycsICct\nLXdhdGNoJ10sCiAgJ2Rldic6IFsnTk9ERV9QTEFURk9STT1uYScsICdOT0RF\nX1BIQVNFPWR2JywgJ05PREVfTU9ERT1kZXYnLCAnd2VicGFjaycsICctLWNv\nbmZpZycsICcuL25vZGVfbW9kdWxlcy92dWUtaGFwLXRvb2xzL3dlYnBhY2su\nY29uZmlnLmpzJywgJy0td2F0Y2gnXQp9Cgpjb25zdCBjcm9zc0FyZ3MgPSBh\ncmdNYXBbYXJnc1swXV07CgppZiAoIWNyb3NzQXJncykgewogIGNvbnNvbGUu\nbG9nKCdVbmtub3duIHNjcmlwdCAiJyArIGFyZ3NbMF0gKyAnIi4nKQogIHBy\nb2Nlc3MuZXhpdCgwKQp9IGVsc2UgewogIGxldCBjcm9zc0VudiA9IHBhdGgu\ncmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9ub2RlX21vZHVsZXMvLmJpbi9jcm9z\ncy1lbnYnKTsKICBjcm9zc0VudiA9IGZzLmV4aXN0c1N5bmMoY3Jvc3NFbnYp\nID8gY3Jvc3NFbnYgOiBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgJ25v\nZGVfbW9kdWxlcy8uYmluL2Nyb3NzLWVudicpOwogIGNvbnN0IHJlc3VsdCA9\nIHNwYXduLnN5bmMoCiAgICBjcm9zc0VudiwKICAgIGNyb3NzQXJncywKICAg\nIHtzdGRpbzogJ2luaGVyaXQnfQogICk7CiAgaWYgKHJlc3VsdC5zaWduYWwp\nIHsKICAgIGlmIChyZXN1bHQuc2lnbmFsID09PSAnU0lHS0lMTCcpIHsKICAg\nICAgY29uc29sZS5sb2coCiAgICAgICAgJ1RoZSBidWlsZCBmYWlsZWQgYmVj\nYXVzZSB0aGUgcHJvY2VzcyBleGl0ZWQgdG9vIGVhcmx5LiAnICsKICAgICAg\nICAgICdUaGlzIHByb2JhYmx5IG1lYW5zIHRoZSBzeXN0ZW0gcmFuIG91dCBv\nZiBtZW1vcnkgb3Igc29tZW9uZSBjYWxsZWQgJyArCiAgICAgICAgICAnYGtp\nbGwgLTlgIG9uIHRoZSBwcm9jZXNzLicKICAgICAgKQogICAgfSBlbHNlIGlm\nIChyZXN1bHQuc2lnbmFsID09PSAnU0lHVEVSTScpIHsKICAgICAgY29uc29s\nZS5sb2coCiAgICAgICAgJ1RoZSBidWlsZCBmYWlsZWQgYmVjYXVzZSB0aGUg\ncHJvY2VzcyBleGl0ZWQgdG9vIGVhcmx5LiAnICsKICAgICAgICAgICdTb21l\nb25lIG1pZ2h0IGhhdmUgY2FsbGVkIGBraWxsYCBvciBga2lsbGFsbGAsIG9y\nIHRoZSBzeXN0ZW0gY291bGQgJyArCiAgICAgICAgICAnYmUgc2h1dHRpbmcg\nZG93bi4nCiAgICAgICkKICAgIH0KICAgIHByb2Nlc3MuZXhpdCgxKQogIH0K\nICBwcm9jZXNzLmV4aXQocmVzdWx0LnN0YXR1cykKfQo=\n'
    })
  })
}