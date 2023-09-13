import '../framed-canvas.css'
import sketch from './standard'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import p5 from 'p5'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

new p5(sketch, windowFrame)
windowFrame.removeChild(loader)
window.init = sketch.init
window.infobox = infobox
window.code = () => sketch.getComp(windowFrame)
window.export_JPG = sketch.export_JPG
handleAction()
