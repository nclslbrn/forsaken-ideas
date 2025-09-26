import { rect, polyline, group, svgDoc } from '@thi.ng/geom'
import { pickRandom } from '@thi.ng/random'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { convert, mul, quantity, NONE, mm, dpi, DIN_A3 } from '@thi.ng/units'

import RULES from './RULES'
import GRIDS from './GRIDS'
import { fillCell } from './fillCell'

const DPI = quantity(96, dpi),
    CUSTOM_FORMAT = quantity([216, 270], 'mm'),
    SIZE = mul(CUSTOM_FORMAT, DPI).deref(),
    MARGIN = convert(mul(quantity(15, mm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d')

const remap = (n, start1, stop1, start2, stop2) =>
        ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2,
    { random, floor, ceil } = Math

let drawElems

ROOT.appendChild(CANVAS)

const init = () => {
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]

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
    const grid_size = [6 + ceil(random() * 4), 8 + ceil(random() * 12)]
    const [patternType, pattern] = cells(grid_size[0], random)
    const [_, grid] = cells(grid_size[1], random, [patternType])
    const allCell = grid.reduce((rects, cell, i) => {
        const [x, y, w, h] = cell
        return [
            ...rects,
            ...pattern.reduce((subgrid, pattern, j) => {
                if (!rule(i, j)) {
                    const [dx, dy, dw, dh] = pattern
                    return [
                        ...subgrid,
                        [
                            remap(x + dx * w, 0, 1, MARGIN, SIZE[0] - MARGIN),
                            remap(y + dy * h, 0, 1, MARGIN, SIZE[1] - MARGIN),
                            dw * w * (SIZE[0] - MARGIN * 2),
                            dh * h * (SIZE[1] - MARGIN * 2)
                        ]
                    ]
                } else {
                    return subgrid
                }
            }, [])
        ]
    }, [])

    const lines = allCell.reduce(
        (acc, cell) => [
            ...acc,
            ...fillCell(cell, floor(random() * 3), floor(random() * 2) * 4).map(
                (ln) => polyline(ln)
            )
        ],
        []
    )

    drawElems = [rect(SIZE, { fill: '#fff' }), group({ stroke: '#000' }, lines)]
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

window.infobox = infobox
handleAction()
