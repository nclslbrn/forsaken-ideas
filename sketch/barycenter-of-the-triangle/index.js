'use strict'
import style from '../../src/sass/project.scss'
import fullCanvas from '../../src/sass/full-canvas.scss'
import sketch from './barycenter-of-the-triangle'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const containerElement = document.body
const loader = document.getElementById('loading')

const P5 = new p5(sketch, containerElement)
document.body.removeChild(loader)

var resizeTimeout
window.addEventListener('resize', function (event) {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(function () {
        containerElement.removeChild(
            containerElement.getElementsByClassName('p5Canvas')[0]
        )
        let P5 = new p5(sketch, containerElement)
    }, 500)
})
window.init = sketch.initSketch
window.export_PNG = sketch.exportPNG
window.infobox = infobox
handleAction()
