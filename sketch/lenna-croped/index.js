'use strict'
import '../../src/sass/project.scss'
import '../../src/sass/frame-canvas.scss'
import sketch from './lenna-croped'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')
new p5(sketch, windowFrame)
windowFrame.removeChild(loader)
window.infobox = infobox
window.exportJPG = sketch.exportJPG
handleAction()
