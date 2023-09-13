import '../framed-canvas.css'
import sketch from './sketch'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'

const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

sketch.launch()
containerElement.removeChild(loader)
window.init = sketch.init
window.downloadSVG = sketch.export
window.infobox = infobox
handleAction()
