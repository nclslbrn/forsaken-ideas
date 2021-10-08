'use strict'
import '../../src/sass/project.scss'
import '../../src/sass/frame-canvas.scss'
import sketch from './the-greatest--p5js.version'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

// p5js version
new p5(sketch, windowFrame)
// svg version
// sketch.init()
windowFrame.removeChild(loader)
window.infobox = infobox
handleAction()
