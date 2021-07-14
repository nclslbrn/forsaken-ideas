'use strict'
import '../../src/sass/project.scss'
import '../../src/sass/frame-canvas.scss'
import './cellular-automata.scss'
import sketch from './cellular-automata--ver.vector'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')
// Raster version
// P5 = new p5(sketch, windowFrame)

// svg version only
sketch.launch()
windowFrame.removeChild(loader)
window.init = sketch.init
// Raster version
// window.download_PNG = sketch.download_PNG
window.infobox = infobox
window.downloadSVG = sketch.downloadSVG
handleAction()
