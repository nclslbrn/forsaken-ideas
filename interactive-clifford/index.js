'use strict'
import style from '../src/sass/project.scss'
import fullCanvas from '../src/sass/full-canvas.scss'
import sketch from './interactive-clifford'
import infobox from '../src/js/infobox'
import handleAction from '../src/js/handle-action'
/* 
import p5 from 'p5'
import 'p5/lib/addons/p5.dom' 
*/

const containerElement = document.body
const loader = document.getElementById('loading')

const P5 = new p5(sketch, containerElement)
document.body.removeChild(loader)

let resizeTimeout
window.addEventListener('resize', function(event) {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(function() {
        containerElement.removeChild(
            containerElement.getElementsByTagName('canvas')[0]
        )
        let P5 = new p5(sketch, containerElement)
    }, 500)
})

window.init = sketch.init
window.infobox = infobox
handleAction()
