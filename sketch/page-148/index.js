import { rect, group, svgDoc, polyline } from '@thi.ng/geom'
import { pickRandom } from '@thi.ng/random'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { convert, mul, quantity, NONE, mm, dpi, DIN_A3 } from '@thi.ng/units'
import { createNoise2D } from 'simplex-noise'

const DPI = quantity(96, dpi), // default settings in inkscape
    SIZE = mul(DIN_A3, DPI).deref(),
    MARGIN = convert(mul(quantity(20, mm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    NSCALE = 0.001

let drawElems, step, noise

ROOT.appendChild(CANVAS)

const init = () => {
    step = Math.ceil(3 + Math.random() * 3) * 4
    noise = createNoise2D()
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]

    const lines = []
    for (let x = MARGIN - step; x < SIZE[0] - MARGIN; x += step) {
        let line = [],
            penDown = true
        for (let y = MARGIN; y < SIZE[1] - MARGIN; y++) {
            const n1 = noise(x * NSCALE, y * NSCALE * 70)
            if (n1 >= -0.5) {
                if (penDown) {
                    const n2 = noise(x * NSCALE, y * NSCALE * 15)
                    line.push([
                        x + Math.cos(n2) * step,
                        y //+ Math.sin(n2) * step * 0.33
                    ])
                }
                penDown = true
            } else {
                penDown = false
                if (line.length) lines.push(line)
                line = []
            }
        }
        if (line.length) lines.push(line)
    }

    drawElems = [
        rect(SIZE, { fill: '#fefef3' }),
        group(
            { stroke: '#111', weight: 2 },
            lines.map((l) => polyline(l))
        )
    ]

    draw(CTX, group({}, drawElems))
}

init()
window.init = init

window['downloadJPG'] = () => {
    downloadCanvas(CANVAS, `Page 148-${FMT_yyyyMMdd_HHmmss()}`, 'jpeg', 1)
}
window['downloadSVG'] = () => {
    downloadWithMime(
        `Page 148-${FMT_yyyyMMdd_HHmmss()}.svg`,
        asSvg(
            svgDoc(
                {
                    width: SIZE[0],
                    height: SIZE[1],
                    viewBox: `0 0 ${SIZE[0]} ${SIZE[1]}`
                },
                group({}, drawElems)
            )
        )
    )
}

window.infobox = infobox
handleAction()
