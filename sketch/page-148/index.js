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
    NSCALE = [0.000007, 0.3]

let drawElems, step, noise

ROOT.appendChild(CANVAS)

const init = () => {
    step = Math.ceil(4 + Math.random() * 4) * 4
    noise = createNoise2D()
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]

    const lines = []
    let x = MARGIN,
        n = noise(x * NSCALE[0], MARGIN * NSCALE[1])

    while (x < SIZE[0] - MARGIN) {
        let y = MARGIN,
            dx = step * Math.sin(n) * 0.15,
            line = [],
            penDown = 1

        while (y < SIZE[1] - MARGIN) {
            n = noise(x * NSCALE[0], y * NSCALE[1])
            if (Math.abs(n) <= 0.8) {
                penDown = 1
            } else {
                if (penDown === 1) {
                    line.length && lines.push(line)
                    line = []
                }
                penDown = penDown < -3 ? 1 : penDown - 1
            }
            penDown === 1 && line.push([dx + x, y])
            dx = step * n * 0.05
            y += step * Math.max(0.005, Math.abs(n) * 0.5)
        }
        if (line.length) lines.push(line)
        x += step * Math.max(0.005, Math.abs(n) * 0.5)
    }

    drawElems = [
        rect(SIZE, { fill: '#fff3ef' }),
        group(
            { stroke: '#222', weight: 2 },
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
