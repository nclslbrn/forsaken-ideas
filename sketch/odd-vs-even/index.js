'use strict'
import '../../src/sass/project.scss'
import '../../src/sass/frame-canvas.scss'
import sketch from './odd-vs-even'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

new p5(sketch, windowFrame)
windowFrame.removeChild(loader)

let resizeTimeout
window.addEventListener('resize', function (event) {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(function () {
        windowFrame.removeChild(windowFrame.getElementsByTagName('canvas')[0])
        new p5(sketch, windowFrame)
    }, 500)
})
window.infobox = infobox
handleAction()
