import { decodeUrl, wrapInBody } from './language/core/utils.js'
import { StandartLibrary } from './language/extentions/extentions.js'
import { languageUtilsString, toJavasScript } from './language/core/toJs.js'
const appendScript = source => {
  const script = document.createElement('script')
  script.innerHTML = source
  document.body.appendChild(script)
}
;(() => {
  appendScript(languageUtilsString)
  appendScript(StandartLibrary.toString())
  appendScript(
    toJavasScript({
      source: wrapInBody(
        decodeUrl(
          location.href.split('preview.html')[1].trim().replace('?s=', ''),
        ),
      ),
    }),
  )
})()
