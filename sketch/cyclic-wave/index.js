import '../framed-canvas.css'
import sketch from './cyclic-wave'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import p5 from 'p5'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')
new p5(sketch, windowFrame)
windowFrame.removeChild(loader)
window.infobox = infobox
handleAction()
