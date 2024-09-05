import { rect, group, svgDoc, polyline, asSvg } from '@thi.ng/geom'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { convert, mul, quantity, NONE, mm, dpi, DIN_A3 } from '@thi.ng/units'
import { createNoise2D } from 'simplex-noise'
import { pickRandom } from '@thi.ng/random'
import { getGlyphVector } from '@nclslbrn/plot-writer'

const DPI = quantity(96, dpi), // default settings in inkscape
    // A3 plot
    SIZE = mul(DIN_A3, DPI).deref(),
    // social network
    // SIZE = mul(quantity([297, 297], mm), DPI).deref(), 
    MARGIN = convert(mul(quantity(20, mm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    STRETCH = [0.5, 5],
    CHARS = [...'13th september on fxhash '],
    MAPPING_OPTIONS = [
        'polarC',
        'polarTL',
        'polarTR',
        'polarBL',
        'polarBR',
        'cartesian1D',
        'cartesian2D'
    ]

const { cos, sin, atan2, random, ceil, round, floor, abs, max, pow } = Math

let drawElems, stepX, stepY, noise, nPosX, nRescale, noiseMapping

ROOT.appendChild(CANVAS)

const init = () => {
    stepX = 24 + ceil(random() * 4) * 8
    stepY = 16 + ceil(random() * 4) * 8
    noise = createNoise2D()
    nPosX = round(SIZE[0] * random())
    nRescale = round(1 + Math.random() * 3) / 10 / pow(10, ceil(random() * 2))
    noiseMapping = pickRandom(MAPPING_OPTIONS)
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]

    const ns = (x, y) => {
        switch (noiseMapping) {
            case 'polarC':
                const lc = atan2(SIZE[1] / 2 - y, SIZE[0] / 2 - x)
                return noise(
                    cos(lc) * nRescale * SIZE[0] * STRETCH[0],
                    sin(lc) * nRescale * SIZE[1] * STRETCH[1]
                )
            case 'polarTL':
                const ltl = atan2(y, x)
                return noise(
                    cos(ltl) * nRescale * SIZE[0] * STRETCH[0],
                    sin(ltl) * nRescale * SIZE[1] * STRETCH[1]
                )
            case 'polarTR':
                const ltr = atan2(y, SIZE[0] - x)
                return noise(
                    cos(ltr) * nRescale * SIZE[0] * STRETCH[0],
                    sin(ltr) * nRescale * SIZE[1] * STRETCH[1]
                )
            case 'polarBL':
                const lbl = atan2(SIZE[1] - y, x)
                return noise(
                    cos(lbl) * nRescale * SIZE[0] * STRETCH[0],
                    sin(lbl) * nRescale * SIZE[1] * STRETCH[1]
                )
            case 'polarBR':
                const lbr = atan2(SIZE[1] - y, SIZE[0] - x)
                return noise(
                    cos(lbr) * nRescale * SIZE[0] * STRETCH[0],
                    sin(lbr) * nRescale * SIZE[1] * STRETCH[1]
                )
            case 'cartesian2D':
                return noise(
                    x * nRescale * STRETCH[0],
                    y * nRescale * STRETCH[1]
                )
            case 'cartesian1D':
                return noise(
                    (x * SIZE[1] + y) * nRescale * STRETCH[0],
                    STRETCH[1]
                )
        }
    }

    const lines = []
    let x = MARGIN,
        n = ns(x, MARGIN)

    while (x < SIZE[0] - MARGIN) {
        let y = MARGIN,
            line = [],
            penDown = 1,
            nStepX = stepX * max(0.125, abs(n)),
            charIdx = 0

        while (y < SIZE[1] - MARGIN) {
            if (ns(x, y) ** 2 >= 0.5) {
                penDown = 1
            } else {
                if (penDown === 1) {
                    line.length && lines.push(line)
                    line = []
                    // extra step to create jump in noise value
                    // to imitate human made drawing
                    nPosX += stepX
                }
                penDown = penDown < -2 ? 1 : penDown - 1
            }
            n = ns(x + nPosX, y)
            const nStepY = stepY * max(0.125, abs(n))
            if (penDown < 1) {
                line.push([x + n * stepX * 0.03, y])
            } else {
                lines.push(
                    ...getGlyphVector(
                        CHARS[charIdx % CHARS.length],
                        [nStepX, nStepY],
                        [x - nStepX / 2, y - nStepY / 4]
                    )
                )
                charIdx++
            }
            y += nStepY
        }
        if (line.length) lines.push(line)
        x += nStepX
    }

    drawElems = [
        rect(SIZE, { fill: '#fff3ef' }),
        group(
            { stroke: '#222', weight: 2 },
            lines.map((l) => polyline(l))
        )
    ]

    console.log(
        `mapping: ${noiseMapping}, step: [${[stepX, stepY]}], scale: [${nRescale}]`
    )
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
window.onkeydown = (e) => {
    if (e.key.toLowerCase() === 'r') window.init()
    if (e.key.toLowerCase() === 'd') window.downloadJPG()
    if (e.key.toLowerCase() === 'p') window.downloadSVG()
}
window.infobox = infobox
handleAction()
