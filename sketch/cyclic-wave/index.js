'use strict'
import style from '../../src/sass/project.scss'
import frameCanvas from '../../src/sass/frame-canvas.scss'
import sketch from './cyclic-wave'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const containerElement = document.body
const loader = document.getElementById('loading')

const P5 = new p5(sketch, containerElement)
document.body.removeChild(loader)
window.infobox = infobox
handleAction()
