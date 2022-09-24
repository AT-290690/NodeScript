import { decodeUrl, wrapInBody } from './language/core/utils.js'
import { StandartLibrary } from './language/extentions/extentions.js'
import { languageUtilsString, toJavasScript } from './language/core/toJs.js'

const elements = {
  makeNodeButton: document.getElementById('create-node'),
  openAppButton: document.getElementById('open-app'),
  app: document.getElementById('app'),
}
const APP = `<body><div id="canvas-container"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/two.js/0.8.10/two.min.js" integrity="sha512-D9pUm3+gWPkv/Wl6vd45vRLjdkdEKGje7BxOxYG0N6m4UlEUB7RSljBwpmJNAOuf6txLLtlaRchoKfzngr/bQg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script>
const canvasContainer = document.getElementById("canvas-container");
const VOID = null;
${languageUtilsString}
</script>
<script>${StandartLibrary.toString()}</script>
</body>`
;(() => {
  const appDocument = elements.app.contentWindow.document
  appDocument.write(APP)
  const script = appDocument.createElement('script')
  script.id = 'main'
  script.innerHTML = toJavasScript({
    source: wrapInBody(
      decodeUrl(
        location.href.split('preview.html')[1].trim().replace('?s=', ''),
      ),
    ),
  })
  appDocument.body.appendChild(script)
  appDocument.close()
})()
