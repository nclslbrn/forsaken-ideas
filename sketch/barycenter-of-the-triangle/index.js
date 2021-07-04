'use strict'
import style from '../../src/sass/project.scss'
import fullCanvas from '../../src/sass/full-canvas.scss'
import sketch from './barycenter-of-the-triangle'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

const P5 = new p5(sketch, windowFrame)
windowFrame.removeChild(loader)

var resizeTimeout
window.addEventListener('resize', function (event) {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(function () {
        windowFrame.removeChild(
            windowFrame.getElementsByClassName('p5Canvas')[0]
        )
        let P5 = new p5(sketch, windowFrame)
    }, 500)
})
window.init = sketch.initSketch
window.export_JPG = sketch.exportJPG
window.infobox = infobox
handleAction()
