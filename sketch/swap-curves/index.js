'use strict'
import '../../src/sass/project.scss'
import '../../src/sass/frame-canvas.scss'
import './swap-curves.scss'
import sketch from './swap-curves'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

new p5(sketch, containerElement)
containerElement.removeChild(loader)

window.init = sketch.init_sketch
window.infobox = infobox
handleAction()

let resizeTimeout
window.addEventListener('resize', function (event) {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(function () {
        containerElement.removeChild(
            containerElement.getElementsByTagName('canvas')[0]
        )
        new p5(sketch, containerElement)
    }, 500)
})
