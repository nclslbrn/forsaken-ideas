'use strict'
import style from '../../src/sass/project.scss'
import frameCanvas from '../../src/sass/frame-canvas.scss'
import dedicatedStyle from './double-curve.scss'
import sketch from './double-curve'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const containerElement = document.body
const loader = document.getElementById('loading')

const P5 = new p5(sketch, containerElement)
document.body.removeChild(loader)

window.download_PNG = sketch.download_PNG
window.init_sketch = sketch.init_sketch
window.infobox = infobox
handleAction()
