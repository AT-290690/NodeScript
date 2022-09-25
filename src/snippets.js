import { decodeUrl, prettier, wrapInBody } from './language/core/utils.js'
import { StandartLibrary } from './language/extentions/extentions.js'
import { languageUtilsString, toJavasScript } from './language/core/toJs.js'
const appendScript = source => {
  const script = document.createElement('script')
  script.innerHTML = source
  document.body.appendChild(script)
  return script
}
const source = document.getElementById('source')
;(() => {
  appendScript(languageUtilsString)
  appendScript(StandartLibrary.toString())
  let main = appendScript('')

  document.getElementById('run').addEventListener('click', () => {
    if (globalThis?.LIBRARY?.SKETCH) {
      globalThis.LIBRARY.SKETCH.destroycomposition()
    }
    main.parentNode.removeChild(main)

    try {
      const dec = decodeUrl(
        (source.value = source.value.split('.html?s=').pop().trim()),
      )
      main = appendScript(
        toJavasScript({
          source: wrapInBody(dec),
        }),
      )
      navigator.clipboard.writeText(prettier(dec))
    } catch (err) {
      main = appendScript('')
    }
  })
})()
