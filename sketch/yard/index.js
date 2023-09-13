import '../full-canvas.css'
import './yard.css'
import sketch from './sketch'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

sketch.launch()
windowFrame.removeChild(loader)
window.infobox = infobox
window.export = sketch.export
window.init = sketch.init
handleAction()
