import '../framed-canvas.css'
import sketch from './grow-from-pattern--vector'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')
// Raster (p5js) version
// new p5(sketch, windowFrame)

// Vector (vanilla js) version
sketch.init()
windowFrame.removeChild(loader)
window.init = sketch.reset
window.export = sketch.export
window.infobox = infobox
//window.exportJPG = sketch.exportJPG
handleAction()
