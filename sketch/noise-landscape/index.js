'use strict'
import style from '../../src/sass/project.scss'
import fullCanvas from '../../src/sass/full-canvas.scss'
import customStyle from './noise-landscape.scss'
import sketch from './noise-landscape'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

const P5 = new p5(sketch, containerElement)
containerElement.removeChild(loader)

window.init = sketch.init
window.export_PNG = sketch.exportPNG
window.infobox = infobox
handleAction()
