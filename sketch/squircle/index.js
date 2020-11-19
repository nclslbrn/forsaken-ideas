'use strict'
import '../../src/sass/project.scss'
import '../../src/sass/frame-canvas.scss'
import 'p5.createLoop'
import squircle from './squircle'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')
const P5 = new p5(squircle, windowFrame)
windowFrame.removeChild(loader)
window.init = squircle.init
window.export_GIF = squircle.export_GIF
window.infobox = infobox
handleAction()
