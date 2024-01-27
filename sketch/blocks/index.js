import p5 from 'p5'
//import { getPalette } from '@nclslbrn/artistry-swatch'
import PALETTES from './palette'
import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')
let canvas, palette, margin

const sketch = (p5) => {
    const _x = (x) => x * (p5.width - margin * 2),
        _y = (y) => y * (p5.height - margin * 2),
        stack = (num) => {
            let o = []
            for (let i = 0; i < num; i++) {
                o.push(Math.random())
            }
            const sum = o.reduce((a, v) => a + v)
            return o.map((v) => v / sum)
        },
        drawCell = (x, y, w, h, b) => {
            const cols = w / b,
                rows = h / b
            for (let c = 0; c < cols; c++) {
                for (let r = 0; r < rows; r++) {
                    const idx = c * Math.floor(cols) + r
                    p5.fill(palette[idx % palette.length])
                    p5.rect(x + c * b, y + r * b, b-2, b-2)
                }
            }
        }

    sketch.init = function () {
        palette = [...(p5.random(PALETTES)).split(';:')]
        p5.drawingContext.save()
        p5.background(palette[0])
        p5.stroke(palette[0])
        p5.fill(palette[0])
        palette.splice(0, 1)
        p5.rect(margin, margin, p5.width - margin * 2, p5.height - margin * 2)
        p5.drawingContext.clip()

        const yRange = stack(p5.random(5, 10))
        let y = margin

        for (let i = 0; i < yRange.length; i++) {
            const dy = _y(yRange[i])
            const xRange = stack(p5.random(5, 10))
            let x = margin
            for (let j = 0; j < xRange.length; j++) {
                const dx = _x(xRange[j])
                drawCell(x, y, dx, dy, margin * 0.15)
                x += dx
            }
            y += dy
        }
        p5.drawingContext.restore()
    }

    sketch.jpg = function () {
        const date = new Date()
        const filename =
            'Blocks.' +
            '-' +
            date.getHours() +
            '.' +
            date.getMinutes() +
            '.' +
            date.getSeconds()
        p5.save(canvas, filename, 'jpg')
    }
    p5.setup = function () {
        canvas = p5.createCanvas(1200, 1600)
        margin = Math.min(p5.width, p5.height) * 0.07
        sketch.init()
    }
}

new p5(sketch, windowFrame)
windowFrame.removeChild(loader)
window.init = sketch.init
window.jpg = sketch.jpg
window.infobox = infobox
handleAction()
