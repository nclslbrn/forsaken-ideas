import { rect, group, svgDoc, polygon } from '@thi.ng/geom'
import { pickRandom, pickRandomKey } from '@thi.ng/random'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
//import '../framed-canvas.css'
import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { convert, mul, quantity, NONE, cm, dpi, DIN_A3 } from '@thi.ng/units'
import { repeatedly2d } from '@thi.ng/transducers'
import { createNoise2D } from 'simplex-noise'
import alea from 'alea'

const DPI = quantity(96, dpi), // default settings in inkscape
    FORMAT = quantity(
        [window.innerWidth, window.innerHeight].map((v) => v / 30),
        cm
    ),
    SIZE = mul(FORMAT, DPI).deref(),
    MARGIN = convert(mul(quantity(2.5, cm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    CELL = 48,
    SCALE = 0.5,
    THRESHOLD = 15,
    RADIUS = 15,
    PALETTES = {
        mono: (v, a) => `hsla(0,0%,${Math.round(v * 100)}%, ${a})`
        /*
        heat: (v, a) =>
            `hsla(${Math.round((1 - v) * 240)},80%,${40 + Math.round(v * 30)}%, ${a})`,
        ocean: (v, a) =>
            `hsla(${200 + Math.round(v * 40)},${60 + Math.round(v * 30)}%,${30 + Math.round(v * 40)}%, ${a})`,
        forest: (v, a) =>
            `hsla(${100 + Math.round(v * 60)},${50 + Math.round(v * 20)}%,${25 + Math.round(v * 40)}%, ${a})`
            */
    },
    POLY_PTS = (x, y) => [
        [x, y],
        [x + CELL, y],
        [x + CELL, y + CELL],
        [x, y + CELL],
        [x, y]
    ],
    { max, abs, floor, sin, cos, PI } = Math

let cols, rows, composition

ROOT.appendChild(CANVAS)

const chebyshev = (ax, ay, bx, by) => max(abs(ax - bx), abs(ay - by))

const init = () => {
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]

    cols = floor(SIZE[0] / CELL)
    rows = floor(SIZE[1] / CELL)

    const noise = createNoise2D(alea(floor(Math.random() * 65536)))
    const freq = SCALE / 10
    const grid = [
        ...repeatedly2d(
            (x, y) => (noise(x * freq, y * freq) + 1) * 0.5,
            cols,
            rows
        )
    ]
    const edgeMap = []
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const v = grid[x + y * cols]
            let isEdge = false
            outer: for (let ny = y - RADIUS; ny <= y + RADIUS; ny++) {
                for (let nx = x - RADIUS; nx <= x + RADIUS; nx++) {
                    if (ny < 0 || ny >= rows || nx < 0 || nx >= cols) continue
                    if (ny === y && nx === x) continue
                    if (chebyshev(x, y, nx, ny) <= RADIUS) {
                        if (
                            Math.abs(v - grid[nx + ny * cols]) >
                            THRESHOLD / 30
                        ) {
                            isEdge = true
                            break outer
                        }
                    }
                }
            }
            edgeMap.push(isEdge)
        }
    }
    const randomPaletteKey = pickRandomKey(PALETTES)
    const pal = PALETTES[randomPaletteKey]
    const innerMargin = [
        (SIZE[0] - cols * CELL) / 2,
        (SIZE[1] - rows * CELL) / 2
    ]
    composition = [
        rect(SIZE, { fill: pal(0, 1) }),
        group(
            {
                scale: [
                    (SIZE[0] - MARGIN * 2) / SIZE[0],
                    (SIZE[1] - MARGIN * 2) / SIZE[1]
                ],
                translate: [MARGIN + innerMargin[0], MARGIN + innerMargin[1]],
                stroke: pal(0, 1)
            },
            [
                ...repeatedly2d(
                    (y, x) => {
                        const idx = x + y * cols
                        const v = grid[idx]
                        const edge = edgeMap[idx]
                        const rectPts = POLY_PTS(x * CELL, y * CELL)
                        const dispPts = rectPts.map(([x, y]) => {
                            const theta = noise(x * freq, y * freq) * PI * 2
                            const dist =
                                noise((x / CELL) * freq, (y / CELL) * freq) *
                                CELL *
                                abs(0.5 / v)
                            return [
                                x + cos(theta) * dist,
                                y + sin(theta) * dist
                            ]
                        })
                        return polygon(dispPts, {
                            fill: pal(v, edge ? 1.0 : 0.05)
                        })
                    },
                    rows,
                    cols
                )
            ]
        )
    ]

    draw(CTX, group({}, composition))
}

init()
window.init = init

window['exportJPG'] = () => {
    downloadCanvas(CANVAS, `Chebyshev grid-${FMT_yyyyMMdd_HHmmss()}`, 'jpeg', 1)
}
window['exportSVG'] = () => {
    downloadWithMime(
        `Chebyshev grid-${FMT_yyyyMMdd_HHmmss()}.svg`,
        asSvg(
            svgDoc(
                {
                    width: SIZE[0],
                    height: SIZE[1],
                    viewBox: `0 0 ${SIZE[0]} ${SIZE[1]}`
                },
                group({}, composition)
            )
        )
    )
}

window.infobox = infobox
handleAction()
