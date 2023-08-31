'use strict'
import '../../src/sass/project.scss'
import '../../src/sass/frame-canvas.scss'
import sketch from './yakoi-kusama'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

new p5(sketch, windowFrame)
windowFrame.removeChild(loader)


window.init_sketch = sketch.init_sketch
window.infobox = infobox
handleAction()
