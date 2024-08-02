import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import p5 from 'p5'

const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')
let canvas
const colors = ['#f3f3f3', '#fdcf5f', '#4887e7', '#f5646d', '#333333']
const sketch = (p5) => {
    sketch.init = () => {
        p5.background(p5.random(colors))
    }

    p5.setup = () => {
        canvas = p5.createCanvas(1200, 1200)
        sketch.init()
    }

    sketch.capture = () => p5.saveCanvas(canvas, '{{title}}.jpg')

    p5.moussePressed = () => {
        p5.saveCanvas()
    }
}

new p5(sketch, containerElement)
containerElement.removeChild(loader)

window.init = sketch.init
window.capture = sketch.capture
window.infobox = infobox
handleAction()
