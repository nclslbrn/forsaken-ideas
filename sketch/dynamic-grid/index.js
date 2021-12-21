'use strict'
import '../../src/sass/project.scss'
import '../../src/sass/frame-canvas.scss'
import sketch from './dynamic-grid'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

sketch.launch()
windowFrame.removeChild(loader)
window.init = sketch.init
window.export = sketch.export
window.infobox = infobox
handleAction()
