import '../full-canvas.css'
import p5 from 'p5'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import getPalette from './getPalette'

const { cos, sin, floor } = Math

const getDistribution = (maxItems) => {
    const items = []
    while (items.length < maxItems) {
        items.push(Math.random())
    }
    const sum = items.reduce((sum, item) => {
        return (sum += item)
    }, 0)
    items.forEach((_, index) => {
        items[index] /= sum
    })
    return items
}

let canvas

const sketch = (p5) => {
    const dpr = devicePixelRatio || 1
    p5.setup = () => {
        canvas = p5.createCanvas(window.innerWidth, window.innerHeight)
        p5.scale(dpr, dpr)
        p5.drawingContext.lineCap = 'square'
        p5.noLoop()
    }

    p5.draw = () => {
        const N = 500,
            iters = 60,
            diag = Math.hypot(p5.width, p5.height),
            margin = diag * 0.035,
            scale = p5.random(0.001, 0.003),
            turbulence = p5.random(4, 8)

        let palette = getPalette()
        p5.background(palette[0])
        p5.noFill()
        palette.splice(0, 1)

        const speed = p5.random(1, 8)

        for (let i = 0; i < N; i++) {
            p5.drawingContext.setLineDash([
                ...getDistribution(p5.random(24, 72)).map((v) => v * p5.width)
            ])
            const pos = {
                x: p5.random(margin, p5.width - margin),
                y: p5.random(margin, p5.height - margin)
            }

            p5.stroke(palette[i % palette.length])
            p5.strokeWeight(floor(p5.random(diag * 0.002, diag * 0.005)))
            p5.beginShape()

            for (let j = 0; j < iters; j++) {
                const angle =
                    turbulence * p5.noise(pos.x * scale, pos.y * scale)

                pos.x += cos(angle) * speed
                pos.y += sin(angle) * speed

                if (
                    pos.x < margin ||
                    pos.y < margin ||
                    pos.x > p5.width - margin ||
                    pos.y > p5.height - margin * 2
                ) {
                    break
                }
                p5.vertex(pos.x, pos.y)
            }
            p5.endShape()
        }
        p5.drawingContext.setLineDash([0])
        p5.strokeWeight(0)
        p5.fill(p5.random(palette))
        p5.textAlign(p5.LEFT, p5.CENTER)
        p5.text(`SCALE: ${scale.toFixed(3)}`, margin, p5.height - margin * 1.5)
        p5.textAlign(p5.RIGHT, p5.CENTER)
        p5.text(
            `TURBULENCE: ${turbulence.toFixed(3)}`,
            p5.width - margin,
            p5.height - margin * 1.5
        )
    }
    sketch.redraw = () => p5.redraw()
    sketch.download = () => p5.save(canvas, 'Rectangle-along-curve.jpg')
}

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

new p5(sketch, windowFrame)
windowFrame.removeChild(loader)
window.init = sketch.redraw
window.download = sketch.download
window.infobox = infobox
handleAction()
