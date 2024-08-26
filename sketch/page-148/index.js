import { rect, group, svgDoc, polyline, asSvg } from '@thi.ng/geom'
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
    NSCALE = 0.0009

let drawElems, step, noise

ROOT.appendChild(CANVAS)

const init = () => {
    step = Math.ceil(2 + Math.random() * 3) * 3
    noise = createNoise2D()
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]

    const lines = []
    for (let x = MARGIN - step; x < SIZE[0] - MARGIN; x += step) {
        let line = [],
            penDown = true,
            lastPenUpY = 0
        for (let y = MARGIN; y < SIZE[1] - MARGIN; y++) {
            const n1 = noise(x * NSCALE * 0.5, y * NSCALE * 75)
            if (n1 >= -0.7) {
                if (penDown) {
                    const n2 = noise(x * NSCALE * 2, lastPenUpY + (line.length * NSCALE * 10))
                    line.push([
                        x + Math.cos(n2) * step,
                        y //+ Math.sin(n2) * step * 0.33
                    ])
                }
                penDown = true
            } else {
                penDown = false
                lastPenUpY = y
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
