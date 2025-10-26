import { rect, polyline, group, svgDoc, asSvg } from '@thi.ng/geom'
import { pickRandom, weightedRandom } from '@thi.ng/random'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { convert, mul, quantity, NONE, mm, dpi, DIN_A3 } from '@thi.ng/units'

import { getGlyphVector } from '@nclslbrn/plot-writer'
import RULES from './RULES'
import GRIDS from './GRIDS'
import { fillCell } from './fillCell'
import { scribbleLine } from './scribbleLine'
import { repeatedly2d } from '@thi.ng/transducers'

const DPI = quantity(96, dpi),
    CUSTOM_FORMAT = quantity(
        [window.innerWidth / 30, window.innerHeight / 30],
        'cm'
    ),
    SIZE = mul(CUSTOM_FORMAT, DPI).deref(),
    MARGIN = convert(mul(quantity(20, mm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    CHARS = [
        '>____|-\\/^#~ ======+',
        '======][------|',
        '/////#\\\\\\<<<<<<<<',
        '0/_]|__/[|__1-^!}\\--r~&_av/==h24]|[[',
        'NOT_A_NUMBER________________',
        '||_______-ALMOST-________-_______',
        'EMPTY-SPACE--------------',
        'OPEN\\SPACE\\\\\\\\\\\\\\\\\\',
        'CELL SIZE - - - - - SAME PRICE - - - - - ',
        'RED_DRUM_________________________',
        'Ingr in the Gr________Ingr walked the gr,___Steel lines bled._____She stumbl on wire,___Red spread.___________The gr began glow,____Crimson fed.__________Metal drank her,______Roots bred.___________She tried pull away,__Iron thread.__________Ingr is the gr,_______The gr is Ingr—dead.__'
    ]

const remap = (n, start1, stop1, start2, stop2) =>
        ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2,
    { random, floor, ceil } = Math

let drawElems

ROOT.appendChild(CANVAS)

const init = () => {
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]

    const str = [...CHARS[floor(random() * CHARS.length)]],
        baseCharSize = 12 + floor(random() * 16),
        char_size = [baseCharSize, baseCharSize * floor(1 + random() * 0.5)],
        glyphGrid = ([cx, cy, cw, ch]) =>
            repeatedly2d(
                (x, y) => [
                    cx + x * char_size[0],
                    cy + y * char_size[1],
                    char_size[0],
                    char_size[1]
                ],
                floor(cw / char_size[0]),
                floor(ch / char_size[1])
            ),
        fillType = weightedRandom(
            [0, 1, 2, 3, 4, 5, 6, 7],
            [3, 3, 3, 3, 1, 1, 1, 1]
        )

    const cells = (numCell, rand, not = []) => {
        const choices = Array.from(Array(GRIDS.length))
            .map((_, i) => i)
            .filter((idx) => !not.includes(idx))

        const gridTypeIdx = floor(random() * choices.length)
        return [
            choices[gridTypeIdx],
            GRIDS[choices[gridTypeIdx]](numCell, rand)
        ]
    }

    const rule = pickRandom(RULES)
    const grid_size = [6 + ceil(random() * 4), 8 + ceil(random() * 3)]
    const [patternType, pattern] = cells(grid_size[0], random)
    const [_, grid] = cells(grid_size[1], random, [patternType])
    const allCell = grid.reduce(
        (rects, cell, i) => {
            const [x, y, w, h] = cell
            const nested = pattern.reduce(
                (subgrid, pattern, j) => {
                    const [dx, dy, dw, dh] = pattern
                    const patternCell = [
                        remap(x + dx * w, 0, 1, MARGIN, SIZE[0] - MARGIN),
                        remap(y + dy * h, 0, 1, MARGIN, SIZE[1] - MARGIN),
                        dw * w * (SIZE[0] - MARGIN * 2),
                        dh * h * (SIZE[1] - MARGIN * 2)
                    ]
                    if (!rule(i, j)) {
                        return [[...subgrid[0], patternCell], subgrid[1]]
                    } else {
                        return [subgrid[0], [...subgrid[1], patternCell]]
                    }
                },
                [[], []]
            )
            return [
                [...rects[0], ...nested[0]],
                [...rects[1], ...nested[1]]
            ]
        },
        [[], []]
    )

    const lines = [
        ...allCell[0].reduce(
            (acc, cell) => [
                ...acc,
                ...fillCell(cell, fillType(), 0).map((ln) =>
                    scribbleLine(ln, 1, 1.5)
                )
            ],
            []
        ),
        ...allCell[1].reduce(
            (acc, cell, cellIdx) => [
                ...acc,
                ...glyphGrid(cell).reduce(
                    (lines, subcell, sbIdx) => [
                        ...lines,
                        ...getGlyphVector(
                            str[(cellIdx + sbIdx) % str.length],
                            [subcell[2], subcell[3]],
                            [subcell[0], subcell[1]]
                        )
                    ],
                    []
                )
            ],
            []
        )
    ].map((ln) => polyline(ln))

    drawElems = [
        rect(SIZE, { fill: '#fff6f6' }),
        group({ stroke: '#222' }, lines)
    ]
    draw(CTX, group({}, drawElems))
}

init()
window.init = init

window['exportJPG'] = () => {
    downloadCanvas(CANVAS, `Grid rules-${FMT_yyyyMMdd_HHmmss()}`, 'jpeg', 1)
}
window['exportSVG'] = () => {
    downloadWithMime(
        `Grid rules-${FMT_yyyyMMdd_HHmmss()}.svg`,
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
document.addEventListener('keypress', (e) => {
    switch (e.key) {
        case 'r':
            window.init()
            break
        case 'j':
            window.exportJPG()
            break
        case 's':
            window.exportSVG()
            break
    }
})
window.infobox = infobox
handleAction()
