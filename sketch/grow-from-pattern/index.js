'use strict'
import '../../src/sass/project.scss'
import '../../src/sass/frame-canvas.scss'
import sketch from './grow-from-pattern--vector'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

sketch.init()
windowFrame.removeChild(loader)
window.init = sketch.reset
window.infobox = infobox
handleAction()
