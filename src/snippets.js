import { decodeUrl, wrapInBody } from './language/core/utils.js'
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
      main = appendScript(
        toJavasScript({
          source: wrapInBody(
            decodeUrl(
              (source.value = source.value.split('.html?s=').pop().trim()),
            ),
          ),
        }),
      )
    } catch (err) {
      main = appendScript('')
    }
  })
})()
