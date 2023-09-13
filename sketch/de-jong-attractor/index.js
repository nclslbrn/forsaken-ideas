import '../framed-canvas.css'
import sketch from './de-jong-attractor'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

sketch.setup()
windowFrame.removeChild(loader)

window.init = sketch.init
window.download_SVG = sketch.export
window.infobox = infobox
handleAction()
