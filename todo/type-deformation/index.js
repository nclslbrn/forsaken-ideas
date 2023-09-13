'use strict'
import '../project.css'
import '../full-canvas.scss'
import sketch from './type-deformation'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'

const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

const P5 = new p5(sketch, containerElement)
containerElement.removeChild(loader)
window.export_PNG = sketch.exportPNG

window.infobox = infobox
handleAction()
