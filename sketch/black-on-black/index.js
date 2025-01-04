import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import p5 from 'p5'
import CONSTANTS from './CONSTANTS'
const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')
const dpr = Math.round(window.devicePixelRatio) || 1

let traits = { constant: null },
    canvas,
    shader

const sketch = (p5) => {
    p5.preload = () => {
        shader = p5.loadShader('./assets/base.vert', './assets/base.frag')
    }

    p5.setup = () => {
        canvas = p5.createCanvas(window.innerWidth, window.innerHeight, p5.WEBGL)
        p5.noStroke()
        sketch.init()
        p5.noLoop()
    }

    p5.draw = () => {
        p5.blendMode()
        p5.shader(shader)
        shader.setUniform('u_resolution', [p5.width * dpr, p5.height * dpr])
        shader.setUniform('u_time', p5.frameCount)
        shader.setUniform('u_mouse', [p5.mouseX, p5.mouseY])
        shader.setUniform('u_constant', traits.constant)

        p5.rect(p5.width * -0.5, p5.height * -0.5, p5.width, p5.height)
    }

    sketch.init = () => {
        /*
        traits.constant =
            [
            Math.round(1000000 * p5.random(-2, 2)) / 1000000,
            Math.round(1000000 * p5.random(-2, 2)) / 1000000,
            Math.round(1000000 * p5.random(-2, 2)) / 1000000,
            Math.round(1000000 * p5.random(-2, 2)) / 1000000
        ]
        */ 
        traits.constant = p5.random(CONSTANTS)
        p5.redraw()
    }

    sketch.capture = () => p5.saveCanvas(canvas, 'Black on black.jpg')
}

window.onkeydown = (e) => {
  e.key === "c" && alert(JSON.stringify(traits.constant))
  e.key === "r" && sketch.init()
}

new p5(sketch, containerElement)
containerElement.removeChild(loader)

window.init = sketch.init
window.capture = sketch.capture
window.infobox = infobox
handleAction()
