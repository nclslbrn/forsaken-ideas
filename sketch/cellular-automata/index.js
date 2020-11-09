'use strict'
import '../../src/sass/project.scss'
import '../../src/sass/frame-canvas.scss'
import './cellular-automata.scss'
import sketch from './cellular-automata'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const containerElement = document.body
const loader = document.getElementById('loading')

const P5 = new p5(sketch, containerElement)
document.body.removeChild(loader)
window.init = sketch.init
window.download_PNG = sketch.download_PNG
window.infobox = infobox
handleAction()
