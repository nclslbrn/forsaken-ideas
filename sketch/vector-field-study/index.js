'use strict'
import style from '../../src/sass/project.scss'
import frameCanvas from '../../src/sass/frame-canvas.scss'
import custom from './vector-field-study.scss'
import sketch from './vector-field-study'
import infobox from '../../src/js/infobox'
import handleAction from '../../src/js/handle-action'

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
        containerElement.removeChild(
            containerElement.getElementsByTagName('select')[0]
        )
        let P5 = new p5(sketch, containerElement)
    }, 500)
})

window.download_PNG = sketch.download_PNG
window.init_sketch = sketch.init_sketch
window.infobox = infobox
handleAction()
