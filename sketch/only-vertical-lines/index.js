import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import p5 from 'p5'

const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')
let canvas,
    shader,
    texture,
    traits = { bandSize: 12, noiseSize: 2.5 }

const dpr = Math.ceil(window.devicePixelRatio) || 1

const sketch = (p5) => {
    sketch.init = () => {
        traits.bandSize = 12 + Math.floor(p5.ceil(p5.random() * 24))
        traits.noiseSize = 2 + p5.random() * 3
    }
    p5.preload = () => {
        shader = p5.loadShader('./assets/base.vert', './assets/base.frag')
    }

    p5.setup = () => {
        canvas = p5.createCanvas(1280, 1280, p5.WEBGL)
        texture = p5.createGraphics(p5.width, p5.height, p5.WEBGL)
        texture.noStroke()
        texture.fill(255)
        sketch.init()
    }

    p5.draw = () => {
        p5.blendMode()
        texture.shader(shader)
        shader.setUniform('u_resolution', [p5.width * dpr, p5.height * dpr])
        shader.setUniform('u_bandSize', traits.bandSize)
        shader.setUniform('u_noiseSize', traits.noiseSize)
        texture.rect(0, 0, p5.width, p5.height)
        p5.texture(texture)
        p5.rect(-p5.width / 2, -p5.height / 2, p5.width, p5.height)
    }

    sketch.capture = () => p5.saveCanvas(canvas, 'vertical-lines-only.jpg')
}

new p5(sketch, containerElement)
containerElement.removeChild(loader)

window.init = sketch.init
window.capture = sketch.capture
window.play = sketch.play
window.infobox = infobox
handleAction()
