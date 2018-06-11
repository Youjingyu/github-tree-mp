interface WeApp extends IApp {
  globalUtils: {
    wxParse: Function
    hightlight: {
      highlightAuto: Function,
      highlight: Function
    },
    base64: {
      decode :Function
    }
    marked: {
      setOptions: Function,
      parse: Function
    },
    html2json: Function
  }
}

const app: WeApp = getApp() as WeApp

export default app