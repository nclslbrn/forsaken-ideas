import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import p5 from 'p5'

const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')
let traits = { noiseSize: null },
    isAnimated = false,
    canvas,
    fontFace,
    shader,
    text

const dpr = Math.round(window.devicePixelRatio) || 1

const sketch = (p5) => {
    p5.preload = () => {
        fontFace = p5.loadFont('./assets/FiraCode-Bold.otf')
        shader = p5.loadShader('./assets/base.vert', './assets/base.frag')
    }

    p5.setup = () => {
        canvas = p5.createCanvas(window.innerWidth, window.innerHeight, p5.WEBGL)
        text = p5.createGraphics(400, 84)
        text.noStroke()
        text.textSize(52)
        text.textFont(fontFace)
        text.textAlign(p5.CENTER, p5.CENTER)
        text.background(0)
        text.fill(255)
        text.text('-LINE-OF-CODE-', 200, 42)
        p5.noStroke()

        p5.noLoop()
        sketch.init()
    }

    p5.draw = () => {
        p5.blendMode()
        p5.shader(shader)
        shader.setUniform('u_resolution', [p5.width * dpr, p5.height * dpr])
        shader.setUniform('u_text', text)
        shader.setUniform('u_textSize', [3, 14])
        shader.setUniform('u_noiseSize', traits.noiseSize)
        shader.setUniform('u_time', p5.frameCount)
        shader.setUniform('u_mouse', [p5.mouseX/p5.width, p5.mouseY/p5.height])
        p5.rect(p5.width * -0.5, p5.height * -0.5, p5.width, p5.height)
    }

    sketch.init = () => {
        traits.noiseSize = 2.0 + p5.random() * 4.0
        !isAnimated && p5.redraw()
  }

    sketch.capture = () => p5.saveCanvas(canvas, '42 lines of code.jpg')

    sketch.play = () => {
        if (isAnimated) {
            p5.noLoop()
        } else {
            p5.loop()
            p5.redraw()
        }
        isAnimated = !isAnimated
        console.log('isAnimated', isAnimated)
    }
}

new p5(sketch, containerElement)
containerElement.removeChild(loader)

window.init = sketch.init
window.capture = sketch.capture
window.play = sketch.play
window.infobox = infobox
handleAction()
