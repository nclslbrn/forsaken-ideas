import '../framed-canvas.css'
import p5 from 'p5'
import sketch from './airport-carpet'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

new p5(sketch, windowFrame)
windowFrame.removeChild(loader)
window.init = sketch.init
window.export = sketch.export
window.infobox = infobox
handleAction()
