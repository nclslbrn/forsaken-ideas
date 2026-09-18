import { polyline, line, rect, group, svgDoc, asSvg } from '@thi.ng/geom'
import { pickRandom, SYSTEM } from '@thi.ng/random'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { repeatedly2d } from '@thi.ng/transducers'
import { draw } from '@thi.ng/hiccup-canvas'
import { convert, mul, quantity, NONE, mm, dpi, DIN_A3 } from '@thi.ng/units'
import { clipPolylinePoly } from '@thi.ng/geom-clip-line'

const DPI = quantity(96, dpi),
    CSTM_FORMAT = quantity([320, 320], mm),
    SIZE = mul(CSTM_FORMAT, DPI).deref(),
    MARGIN = convert(mul(quantity(15, mm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d')

let width, height, drawElems, protocolValues

ROOT.appendChild(CANVAS)

const PAPER = '#f2ede1'
const INK = '#1a1a1a'
const GRID = '#e8b4ae'
const STROKE_WEIGHT = 4

// normalized anchor points on a unit cell
const TL = [0, 0],
    TM = [0.5, 0],
    TR = [1, 0]
const ML = [0, 0.5],
    MR = [1, 0.5]
const BL = [0, 1],
    BM = [0.5, 1],
    BR = [1, 1]

// line motifs per cell — straight diagonals (steep + shallow), horizontals,
// and two-segment chevrons — modeled on RAM 5's per-cell edge-to-edge lines
const TEMPLATES = [
    [ML, MR],
    [TL, BR],
    [BL, TR],
    [TM, MR],
    [TM, ML],
    [BM, MR],
    [BM, ML],
    [TL, MR],
    [TR, ML],
    [BL, MR],
    [BR, ML],
    [ML, TM, MR],
    [ML, BM, MR]
]

// generates n parallel copies of a path, offset along its own normal direction
const parallelCopies = (pts, count, spacing) => {
    if (count <= 1) return [pts]
    const [x0, y0] = pts[0]
    const [x1, y1] = pts[pts.length - 1]
    const dx = x1 - x0,
        dy = y1 - y0
    const len = Math.hypot(dx, dy) || 1
    const nx = -dy / len,
        ny = dx / len // perpendicular unit vector
    const start = -(count - 1) / 2
    return Array.from({ length: count }, (_, i) => {
        const off = (start + i) * spacing
        return pts.map(([x, y]) => [x + nx * off, y + ny * off])
    })
}

const buildCell = (rand, x, y, w, h) => {
    const template = pickRandom(TEMPLATES, rand)
    const pts = template.map(([tx, ty]) => [x + tx * w, y + ty * h])
    const count = rand.minmaxInt(3, 10, Math.random)
    const spacing = Math.min(w, h) * 0.5
    return parallelCopies(pts, count, spacing)
}

const buildGrid = (numColRow, cellW, cellH) => {
    const lines = []
    for (let i = 0; i <= numColRow; i++) {
        const x = MARGIN + i * cellW
        const y = MARGIN + i * cellH
        lines.push(
            line([x, MARGIN], [x, MARGIN + height], {
                stroke: GRID,
                weight: 1
            }),
            line([MARGIN, y], [MARGIN + width, y], { stroke: GRID, weight: 1 })
        )
    }
    return lines
}

const setup = () => {
    width = SIZE[0] - MARGIN * 2
    height = SIZE[1] - MARGIN * 2
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]

    const rand = SYSTEM,
        numColRow = rand.minmaxInt(8, 20, Math.random),
        cellW = width / numColRow,
        cellH = height / numColRow,
        cellsPos = [
            ...repeatedly2d(
                (x, y) => [MARGIN + cellW * x, MARGIN + cellH * y],
                numColRow,
                numColRow
            )
        ]

    protocolValues = { numColRow, cellW, cellH }

    drawElems = [
        rect(SIZE, { fill: PAPER }),
        ...buildGrid(numColRow, cellW, cellH),
        ...cellsPos.flatMap(([x, y]) => {
            const polys = buildCell(rand, x, y, cellW, cellH)
            return polys.reduce(
                (acc, poly) => [
                    ...acc,
                    ...clipPolylinePoly(poly, [
                        [x, y],
                        [x + cellW, y],
                        [x + cellW, y + cellH],
                        [x, y + cellH]
                    ]).map((p) =>
                        polyline(p, { stroke: INK, weight: STROKE_WEIGHT })
                    )
                ],
                []
            )
        })
    ]

    draw(CTX, group({}, drawElems))
    console.log(protocolValues)
}

setup()
window.setup = setup

window['exportJPG'] = () => {
    downloadCanvas(CANVAS, `Ram 5-${FMT_yyyyMMdd_HHmmss()}`, 'jpeg', 1)
}
window['exportSVG'] = () => {
    downloadWithMime(
        `Ram 5-${FMT_yyyyMMdd_HHmmss()}.svg`,
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
