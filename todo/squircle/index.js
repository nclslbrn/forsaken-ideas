import '../framed-canvas.css'
import '../framed-two-columns.css'
import 'p5.createLoop'
import squircle from './squircle'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import p5 from 'p5'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

new p5(squircle, windowFrame)
windowFrame.removeChild(loader)
window.init = squircle.init
window.export_GIF = squircle.export_GIF
window.infobox = infobox
handleAction()
