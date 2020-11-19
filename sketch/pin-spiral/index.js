'use strict'
import '../../src/sass/project.scss'
import '../../src/sass/frame-canvas.scss'
import pinSpiral from './pin-spiral'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

const P5 = new p5(pinSpiral, containerElement)
containerElement.removeChild(loader)
window.infobox = infobox
handleAction()
