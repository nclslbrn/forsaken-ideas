import '../framed-canvas.css'
import sketch from './clifford-attractor'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import p5 from 'p5'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

new p5(sketch, windowFrame)
windowFrame.removeChild(loader)

window.init = sketch.init
window.download_JPG = sketch.downloadJPG

window.infobox = infobox
handleAction()
