'use strict'
import style from '../../src/sass/project.scss'
import fullCanvas from '../../src/sass/frame-canvas.scss'
import sketch from './three-template'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const containerElement = document.body
const loader = document.getElementById('loading')
sketch.init()
sketch.animate()
document.body.removeChild(loader)

/*
window.init = sketch.init
window.export_PNG = sketch.exportPNG
*/
window.infobox = infobox
handleAction()
