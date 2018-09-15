const map = {
  'js': { lang: 'javascript', render: 'javascript' },
  'css': { lang: 'css', render: 'css' },
  'wxss': { lang: 'wxss', render: 'css' },
  'html': { lang: 'html', render: 'markup' },
  'wxml': { lang: 'wxml', render: 'markup' },
  'vue': { lang: 'vue', render: 'markup' },
  'jsx': { lang: 'jsx', render: 'markup' },
  'tsx': { lang: 'typescript', render: 'typescript' },
  'ts': { lang: 'typescript', render: 'typescript' },
  'json': { lang: 'json', render: 'json' },
  'dart': { lang: 'dart', render: 'dart' },
  'go': { lang: 'go', render: 'go' },
  'less': { lang: 'less', render: 'less' },
  'scss': { lang: 'sass', render: 'sass' },
  'java': { lang: 'java', render: 'java' },
  'py': { lang: 'py', render: 'python' },
  'php': { lang: 'php', render: 'php' },
  'kt': { lang: 'kotlin', render: 'kotlin' },
  'swift': { lang: 'swift', render: 'swift' },
  'c': { lang: 'c', render: 'c' },
  'h': { lang: 'h', render: 'h' },
  'm': { lang: 'm', render: 'm' },
  'cpp': { lang: 'c++', render: 'clike' },
  'cs': { lang: 'c#', render: 'clike' },
  'sh': { lang: 'bash', render: 'bash' },
  'bash': { lang: 'bash', render: 'bash' }
}
const supportLanguage = Object.keys(map).reduce((obj, key) => {
  obj[map[key].lang] = map[key].render
  return obj
}, {})
module.exports = {
  languageMap: map,
  supportLanguage
}
