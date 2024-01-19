import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import p5 from 'p5'

const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')
let f, canvas
const sketch = (p5) => {
    const res = 2, m = 520,
        wobbly = (x, t) =>
            Math.sin(1.2 * x - 1 * t + 1 + 2 * Math.sin(2 * x + 1.3 * t + 5) ** 3)
    p5.preload = () => {
        f = p5.loadFont('./assets/InterDisplay-Black.otf')
    }
    p5.setup = () => {
        canvas = p5.createCanvas(m*2, m*2)
        p5.textFont(f, 64)
        p5.textAlign(p5.CENTER)
        p5.fill('#333')
        p5.noStroke()
        //p5.saveGif('wobbly', 60, { units: 'frames'})
    }
    sketch.capture = () => p5.saveCanvas(canvas, 'wobbly-function.jpg')

    p5.draw = () => {
        const t = p5.frameCount / 30
        p5.background(250)
        for (let i = -res; i < res; i += 0.25) {
            for (let j = -res; j < res; j += 0.25) {
                const x = m + i * m * 0.45,
                    y = m + j * m * 0.45,
                    h = j + 0.5 - wobbly(i, t)

                p5.text(
                  h < 0.5 ? '0' : h < 0.75 ? '~' : '1', x+32, y+48)
        
            }
        }
    }
    p5.moussePressed = () => {
        p5.saveCanvas()
    }
    p5.windowResized = () => {
        isPlaying = false
        const size = sketchSize()
        p5.resizeCanvas(size, size)
    }
}

new p5(sketch, containerElement)
containerElement.removeChild(loader)

window.init = sketch.init_sketch
window.capture = sketch.capture
window.infobox = infobox
handleAction()
