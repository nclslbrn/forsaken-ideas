import '../framed-canvas.css'
import sketch from './sketch'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'

const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

sketch.init()
containerElement.removeChild(loader)
window.init = sketch.init
window.export = sketch.export
window.fold = sketch.fold
window.infobox = infobox
handleAction()
