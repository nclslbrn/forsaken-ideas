'use strict'
import '../../src/sass/project.scss'
import '../../src/sass/frame-canvas.scss'
import 'p5.createLoop'
import sketch from './noise-grid-2D'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

new p5(sketch, containerElement)
containerElement.removeChild(loader)
window.init = sketch.init
window.infobox = infobox
window.exportJPG = sketch.exportJPG
handleAction()
