'use strict'
import '../../src/sass/project.scss'
import '../../src/sass/frame-canvas.scss'
import './polar-curve.scss'
import sketch from './polar-curve'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

const P5 = new p5(sketch, windowFrame)
windowFrame.removeChild(loader)

window.init = sketch.init
window.export_PNG = sketch.PNG
window.infobox = infobox
handleAction()
