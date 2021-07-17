'use strict'
import '../../src/sass/project.scss'
import '../../src/sass/full-canvas.scss'
import sketch from './sketch'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

sketch.launch()
windowFrame.removeChild(loader)
window.infobox = infobox
window.export = sketch.export
handleAction()
