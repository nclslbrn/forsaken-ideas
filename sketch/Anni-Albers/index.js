import p5 from 'p5'
import { getPalette } from '@nclslbrn/artistry-swatch'
import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')
let canvas, palette, margin, base

const { min, random, round } = Math

const sketch = (p5) => {
    const stack = (len, max) => {
            let o = [],
                sum = 0
            while (sum <= len) {
                const r = random() * max
                const v = round(r / base) * base
                o.push(min(len - sum, v))
                sum += v
            }
            return o
        },
        drawCell = (x, y, w, h, b) => {
            const oneOfTwo = Math.random() > 0.75,
                cols = w / (b * 2),
                rows = h / b

            for (let c = 0; c < cols; c++) {
                for (let r = 0; r < rows; r++) {
                    const idx = c * Math.floor(cols) + r
                    if (!oneOfTwo && idx % 2 === 0) {
                        const color =
                                palette.colors[
                                    r % min(2, palette.colors.length)
                                ],
                            dx = c * b * 2,
                            dy = r * b
                        p5.fill(color)
                        p5.rect(
                            x + dx,
                            y + dy,
                            dx + b * 2 > w ? w - dx : b * 2,
                            dy + b > h ? h - dy : b
                        )
                    }
                }
            }
        }

    sketch.init = function () {
        base = p5.random([4, 8, 16]) * 4
        palette = getPalette()
        //p5.random([albers, alys, martin, mura, freud])
        p5.background(palette.background)
        p5.noStroke()
        //p5.stroke(palette.background)

        const yRange = stack(p5.height - margin * 2, 256)
        let y = margin

        for (let i = 0; i < yRange.length; i++) {
            const dy = yRange[i]
            const xRange = stack(p5.width - margin * 2, 256)
            let x = margin
            for (let j = 0; j < xRange.length; j++) {
                const dx = xRange[j]
                palette.colors = p5.shuffle(palette.colors)
                drawCell(x, y, dx, dy, base / 2)
                x += dx
            }
            y += dy
        }
    }

    sketch.jpg = function () {
        const date = new Date()
        const filename =
            'Anni-Albers.' +
            '-' +
            date.getHours() +
            '.' +
            date.getMinutes() +
            '.' +
            date.getSeconds()
        p5.save(canvas, filename, 'jpg')
    }
    p5.setup = function () {
        canvas = p5.createCanvas(1200, 1200)
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

