'use strict'
import '../../src/sass/project.scss'
import '../../src/sass/frame-canvas.scss'
import pinSpiral from './pin-spiral'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const containerElement = document.body
const loader = document.getElementById('loading')

const P5 = new p5(pinSpiral, containerElement)
document.body.removeChild(loader)

/*
window.init = sketch.init
window.export_PNG = sketch.exportPNG
*/
window.infobox = infobox
handleAction()
