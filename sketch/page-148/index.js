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
    CTX = CANVAS.getContext('2d')

let drawElems, stepX, stepY, noise, nPosX, nRescale

ROOT.appendChild(CANVAS)

const init = () => {
    stepX = Math.ceil(8 + Math.random() * 4) * 2
    stepY = Math.ceil(12 + Math.random() * 2) * 2
    noise = createNoise2D()
    nPosX = SIZE[0] * Math.random()
    nRescale = 0.7 / Math.pow(10, Math.ceil(Math.random() * 3))
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]

    const ns = (x, y) => {
    const l = Math.atan2(SIZE[1]-y, SIZE[0]-x)
    return noise(Math.cos(l) * nRescale * SIZE[0], Math.sin(l) * nRescale * SIZE[1])
  }
    const lines = []
    let x = MARGIN,
        n = ns(x, MARGIN)

    while (x < SIZE[0] - MARGIN) {
        let y = MARGIN,
            line = [],
            penDown = 1

        while (y < SIZE[1] - MARGIN) {
            if (ns(x, y) <= 0.5) {
                penDown = 1
            } else {
                if (penDown === 1) {
                    line.length && lines.push(line)
                    line = []
                    // extra step to create jump in noise value 
                    // to imitate human made drawing  
                    nPosX += stepX
                }
                penDown =  penDown < -2 ? 1 : penDown - 1
            }
            const n = ns(x + nPosX, y)
            penDown === 1 && line.push([x + n * stepX * 0.03, y])
            y += stepY * Math.max(0.123, Math.abs(n) * 0.66)
        }
        if (line.length) lines.push(line)
        x += stepX * Math.max(0.123, Math.abs(n) * 0.66)
    }

    drawElems = [
        rect(SIZE, { fill: '#fff3ef' }),
        group(
            { stroke: '#222', weight: 2 },
            lines.map((l) => polyline(l))
        )
    ]

    console.log(`step: [${[stepX, stepY]}], scale: [${nRescale}]`)
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
