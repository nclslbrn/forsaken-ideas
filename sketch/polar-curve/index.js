'use strict'
import style from '../../src/sass/project.scss'
import fullCanvas from '../../src/sass/frame-canvas.scss'
import sketch from './polar-curve'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const loader = document.getElementById('loading')

const P5 = new p5(sketch, document.body)
document.body.removeChild(loader)

window.init = sketch.init
window.export_PNG = sketch.PNG
window.infobox = infobox
handleAction()
