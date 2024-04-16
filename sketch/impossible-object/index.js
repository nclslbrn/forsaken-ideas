import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { getPalette, palettes } from '@nclslbrn/artistry-swatch'

const containerElement = document.getElementById('windowFrame'),
    loader = document.getElementById('loading'),
    cnvs = document.createElement('canvas'),
    ctx = cnvs.getContext('2d'),
    { floor, random } = Math,
    minmaxF = (min, max) => random() * (max - min) + min,
    minmaxI = (min, max) => floor(random() * (max - min + 1)) + min,
    pickOne = (items) => items[floor(random() * items.length)],
    shuffle = (items) => {
        return items.sort((a, b) => 0.5 - random())
    }

let shapes = [],
    palette
/*
{
  x, w, h, s, d, col
} as pair [shadow, solid]
*/
const sketch = {
    drawSide: (sh, side) => {
        const { w, h } = sh
        const c = { x: sh.x + w / 2, y: sh.y + h / 2 }
        ctx.save()
        const part = (sh.side + side) % 4
        const reg = new Path2D()
        reg.rect(0, 0, cnvs.width, cnvs.height)
        reg.rect(
            c.x - w * sh.s * 0.5,
            c.y - h * sh.s * 0.5,
            sh.w * sh.s,
            sh.h * sh.s
        )
        ctx.clip(reg, 'evenodd')
        ctx.fillStyle = sh.col
        ctx.strokeStyle = '#ccc'
        ctx.beginPath()
        ctx.moveTo(c.x, c.y)
        if (part === 0) {
            ctx.lineTo(c.x - w / 2, c.y - h / 2)
            ctx.lineTo(c.x + w / 2, c.y - h / 2)
        } else if (part === 1) {
            ctx.lineTo(c.x + w / 2, c.y - h / 2)
            ctx.lineTo(c.x + w / 2, c.y + h / 2)
        } else if (part === 2) {
            ctx.lineTo(c.x + w / 2, c.y + h / 2)
            ctx.lineTo(c.x - w / 2, c.y + h / 2)
        } else if (part === 3) {
            ctx.lineTo(c.x - w / 2, c.y + h / 2)
            ctx.lineTo(c.x - w / 2, c.y - h / 2)
        }
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        ctx.restore()
    },
    createShape: (x, y, w, h, i) => {
        const s = minmaxF(0.75, 0.95)
        const disp = [
            [-1, 0],
            [0, -1],
            [1, 0],
            [0, 1]
        ]
        const dim = [w, h]
        const d = pickOne(disp).map((v, i) => (dim[i] - s * dim[i]) * 0.5 * v)
        const col1 = palette.colors[i % palette.colors.length]
        const col2 = palette.colors[(i+1) % palette.colors.length]
        const side = 0 //minmaxI(0, 3)
        shapes.push([
            {
                x: x + d[0],
                y: y + d[1],
                w: w,
                h: h,
                s: s,
                side,
                col: col2
            },
            {
                x,
                y,
                w,
                h,
                s,
                col : col1,
                side
            }
        ])
    },
    init: () => {
        palette = getPalette({ theme: 'dark' })
        ctx.fillStyle = palette.background
        ctx.fillRect(0, 0, cnvs.width, cnvs.height)
        shapes = []
        const N = minmaxI(4, 6),
            d = cnvs.width / (N+1)

        for (let x = 0; x < N; x++) {
            for (let y = 0; y < N; y++) {
                const i = x * N + y
                const w = d * (i % 2 === 0 ? minmaxF(1, 1.4) : minmaxF(0.6, 1))
                const h = d * (i % 2 === 0 ? minmaxF(1, 1.4) : minmaxF(0.6, 1))
                sketch.createShape(
                    ((1 + x) * d) - (w / 2),
                    ((1 + y) * d) - (h / 2),
                    w,
                    h,
                    i
                )
            }
        }
        /*
        for (let i = 0; i < minmaxI(8, 24); i++) {
            sketch.createShape(
                minmaxI(m, cnvs.width - m * 2),
                minmaxI(m, cnvs.height - m * 2),
                cnvs.width / minmaxI(3, 8),
                cnvs.height / minmaxI(3, 8)
            )
        }
  */
        for (let j = 0; j < 4; j++) {
            shapes.forEach((sh) => { 
              sketch.drawSide(sh[0], j)
              sketch.drawSide(sh[1], j)
            })
        }  
    },
    capture: () => {}
}
cnvs.width = 1200
cnvs.height = 1200
sketch.init()
containerElement.appendChild(cnvs)
containerElement.removeChild(loader)

window.init = sketch.init
window.capture = sketch.capture
window.infobox = infobox
handleAction()
