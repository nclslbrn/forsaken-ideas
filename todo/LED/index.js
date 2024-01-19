import p5 from 'p5'
import {
    getPalette,
    albers,
    alys,
    martin,
    mura,
    freud
} from '@nclslbrn/artistry-swatch'
import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { RGB_S3TC_DXT1_Format } from 'three'

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
                    const idx = c * Math.floor(cols) + r,
                          dx = c * b,
                          dy = r * b
                    
                    p5.fill(palette.colors[idx % palette.colors.length])
                    p5.rect(
                      x + dx, 
                      y + dy, 
                      dx + b > w ? w - dx : b, 
                      dy + b > h ? h - dy : b
                    )
                }
            }
        }

    sketch.init = function () {
        palette = getPalette()
        //p5.random([albers, alys, martin, mura, freud])
        p5.background(palette.background)
        p5.noStroke()
        //p5.stroke(palette.background)

        const yRange = stack(p5.random(5, 10))
        let y = margin

        for (let i = 0; i < yRange.length; i++) {
            const dy = _y(yRange[i])
            const xRange = stack(p5.random(6, 12))
            let x = margin
            for (let j = 0; j < xRange.length; j++) {
                const dx = _x(xRange[j])
                p5.fill(palette.colors[(i + j) % palette.colors.length])
                drawCell(x, y, dx, dy, margin * 0.2)
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
