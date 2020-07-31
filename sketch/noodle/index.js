'use strict'
import style from '../../src/sass/project.scss'
import fullCanvas from '../../src/sass/frame-canvas.scss'
import sketch from './noodle'
import infobox from '../../src/js/infobox'
import handleAction from '../../src/js/handle-action'

// Offline fallback
import offlineP5 from '../../src/js/offline-p5'
offlineP5()
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
/*
window.init = sketch.init
window.export_PNG = sketch.exportPNG
*/
window.infobox = infobox
handleAction()
