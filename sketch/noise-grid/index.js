import '../framed-canvas.css'
import 'p5.createLoop'
import sketch from './noise-grid-2D'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import p5 from 'p5'

const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

new p5(sketch, containerElement)
containerElement.removeChild(loader)
window.init = sketch.init
window.infobox = infobox
window.exportJPG = sketch.exportJPG
handleAction()
