'use strict'
import style from '../../src/sass/project.scss'
import fullCanvas from '../../src/sass/frame-canvas.scss'
import sketch from './falling-cube'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const containerElement = document.body
const loader = document.getElementById('loading')

const P5 = new p5(sketch, containerElement)
document.body.removeChild(loader)

let resizeTimeout
window.addEventListener('resize', function (event) {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(function () {
        containerElement.removeChild(
            containerElement.getElementsByTagName('canvas')[0]
        )
        let P5 = new p5(sketch, containerElement)
    }, 500)
})

window.infobox = infobox
handleAction()
