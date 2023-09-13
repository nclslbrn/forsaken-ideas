import '../full-canvas.css'
import sketch from './moving-light'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import p5 from 'p5'

const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

new p5(sketch, containerElement)
containerElement.removeChild(loader)
window.init = sketch.init
window.export_PNG = sketch.exportPNG
window.infobox = infobox
handleAction()
