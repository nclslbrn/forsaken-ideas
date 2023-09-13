import '../framed-canvas.css'
import pinSpiral from './pin-spiral'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import p5 from 'p5'
const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

new p5(pinSpiral, containerElement)
containerElement.removeChild(loader)
window.infobox = infobox
handleAction()
