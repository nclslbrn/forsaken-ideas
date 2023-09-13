import '../framed-canvas.css'
import sketch from './sketch'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'

const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

sketch.launch()
containerElement.removeChild(loader)
window.export = sketch.export
window.init = sketch.init
window.infobox = infobox
handleAction()
