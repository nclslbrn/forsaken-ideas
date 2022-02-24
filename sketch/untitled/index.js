'use strict'
import '../../src/sass/project.scss'
import '../../src/sass/frame-canvas.scss'
import sketch from './sketch'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

sketch.launch()
containerElement.removeChild(loader)
window.init = sketch.init
window.export = sketch.export
window.fold = sketch.cutTile
window.infobox = infobox
handleAction()
