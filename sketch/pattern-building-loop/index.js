'use strict'
import '../../src/sass/project.scss'
import '../../src/sass/frame-canvas.scss'
import patternBuildingLoop from './pattern-building-loop'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

const P5 = new p5(patternBuildingLoop, containerElement)
containerElement.removeChild(loader)

/*
window.init = sketch.init
window.export_PNG = sketch.exportPNG
*/
window.infobox = infobox
handleAction()
