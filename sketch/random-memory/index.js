import '../framed-canvas.css'
import '../framed-two-columns.css'
import sketch from './random-memory'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

sketch.init()
windowFrame.removeChild(loader)
window.infobox = infobox
window.download = sketch.download
handleAction()
