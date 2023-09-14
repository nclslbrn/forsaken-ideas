import '../framed-canvas.css'
import p5 from 'p5'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'

// Noise dimension (change between generation)
let d = 0,
    canvas

const sketch = (p5) => {
    const size = 1200,
        patterns = [3, 5, 6, 7, 9, 10, 11, 12, 13, 15],
        sentence = [...'GET OUT OF MY MIND']

    p5.setup = () => {
        canvas = p5.createCanvas(size, size)
        canvas.elt.style.aspectRatio = '1 / 1'
        p5.noLoop()
    }

    p5.draw = () => {
        const cellSize = Math.round(p5.random(12, 24)),
            cols = size / cellSize,
            rows = size / cellSize,
            margin = Math.round(p5.random(3, 8)),
            g = patterns[Math.floor(Math.random() * patterns.length)]

        p5.background(20)
        p5.noStroke()
        p5.fill('white')
        p5.textSize(cellSize)

        for (let y = margin; y < rows - margin; y++) {
            for (let x = margin; x < cols - margin; x++) {
                if ((x ^ y) % g !== 0) {
                    for (let i = 0; i < p5.random(16, 64); i++) {
                        p5.fill((i / 20) * 255)
                        const n = 10 * p5.noise(x * 0.01, y * 0.01, i * 0.01)
                        p5.text(
                            sentence[(y * rows + x) % sentence.length],
                            d +
                                x * cellSize +
                                Math.cos(n) * i * cellSize * 0.25,
                            d + y * cellSize + Math.sin(n) * i * cellSize * 0.25
                        )
                    }
                } else {
                    p5.fill(Math.random() > 0.99 ? 'tomato' : 180)
                    p5.text('█', x * cellSize, y * cellSize)
                }
            }
        }
    }
    sketch.init = () => {
        d++
        p5.redraw()
    }
    sketch.exportJPG = () => p5.saveCanvas(canvas, 'Get-out-of-my-mind', 'jpg')
}

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

new p5(sketch, windowFrame)
windowFrame.removeChild(loader)
window.init = sketch.init
window.export_JPG = sketch.exportJPG
window.infobox = infobox
handleAction()
