'use strict'
import style from '../../src/sass/project.scss'
import fullCanvas from '../../src/sass/full-canvas.scss'
import customStyle from './noise-landscape.scss'
import sketch from './noise-landscape'
import infobox from '../../src/js/infobox'
import handleAction from '../../src/js/handle-action'

const containerElement = document.body
const loader = document.getElementById('loading')

const P5 = new p5(sketch, containerElement)
document.body.removeChild(loader)

window.init = sketch.init
window.export_PNG = sketch.exportPNG
window.infobox = infobox
handleAction()
