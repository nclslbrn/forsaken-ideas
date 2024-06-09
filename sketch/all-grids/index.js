import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { getGlyphVector } from '@nclslbrn/plot-writer'
import { repeatedly, range } from '@thi.ng/transducers'
import { polyline, rect, group, svgDoc, asSvg, line } from '@thi.ng/geom'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { $compile } from '@thi.ng/rdom'
import { canvas } from '@thi.ng/hiccup-html'
import { adaptDPI, isHighDPI } from '@thi.ng/canvas'
import { convert, mul, quantity, NONE } from '@thi.ng/units'

const ROOT = document.getElementById('windowFrame')
const A3 = quantity([297, 420], 'mm')
const DPI_100 = quantity(100, 'dpi')
const SIZE = convert(mul(A3, DPI_100), NONE)

document.body.style.overflowY = 'auto'
document.body.style.height = '100vh'
let comp = group(),
    cnvs = null,
    grids = [],
    cuts = [],
    cutSize = [0.33, 0.66, 0.5],
    txtSize = 60

const text = [
    [...'+------------ ALL GRIDS -------------+'],
    [...'|                                    |'],
    [...'|    First cut the cell in half      |'],
    [...'|  then in a third, in two thirds    |'],
    [...'|              or in half.           |'],
    [...'+------------------------------------+']
]

const splitCell = (x, y, g, i) => {
    console.log(grids[g].length < 2)
    // Get the last or penultimate cell ID
    const splitOn =
            y === 3 ? (x % 2 === 0 ? 'x' : 'y') : (x + i) % 2 === 0 ? 'x' : 'y',
        // first div in middle second 2/3 or 1/33 on pair row
        splitAt = i === 0 ? 0.5 : cutSize[y % cutSize.length],
        // Get cell to divide property
        toSplit = grids[g].length < 2 || x < 2 ? 0 : 1,
        // Get cell property
        [cx, cy, cw, ch] = grids[g][toSplit],
        // Based on current iteration choose how to split cell
        splitted = []
    if (splitOn === 'x') {
        splitted.push(
            ...[
                [cx, cy, cw * splitAt, ch],
                [cx + cw * splitAt, cy, cw * (1 - splitAt), ch]
            ]
        )
        cuts[g].push([
            [cx + splitAt, cy],
            [cx + splitAt, cy + ch]
        ])
    } else {
        splitted.push(
            ...[
                [cx, cy, cw, ch * splitAt],
                [cx, cy + ch * splitAt, cw, ch * (1 - splitAt)]
            ]
        )
        cuts[g].push([
            [cx, cy + splitAt],
            [cx + cw, cy + splitAt]
        ])
    }
    grids[g].splice(toSplit, 1)
    grids[g].push(...splitted)
}

const init = () => {
    cnvs = document.getElementById('main')
    // Nothing fancy here we need a context to draw in the canvas
    const ctx = cnvs.getContext('2d')
    const dpr = adaptDPI(cnvs, ...SIZE)
    const variation = 2 // depends of splitCell choices
    const between = SIZE[0] * 0.03
    const rowCol = variation * 2
    const numGrids = rowCol * (rowCol - 1)
    // init all grid with the first cell (full size)
    grids = [...repeatedly(() => [[0, 0, 1, 1]], numGrids * numGrids)]
    cuts = [...repeatedly(() => [], numGrids * numGrids)]
    for (let x = 0; x < rowCol; x++) {
        for (let y = 0; y < rowCol - 1; y++) {
            for (let j = 0; j < variation; j++) {
                splitCell(x, y, y + rowCol * x, j, rowCol)
            }
        }
    }

    const gridWidth = (SIZE[0] - between * 3 - between * rowCol) / (rowCol - 1)
    const gridHeight = (SIZE[0] * 1.2 - between * 3 - between * rowCol) / rowCol
    const cells = [],
        numbers = []

    for (let x = 0; x < rowCol - 1; x++) {
        for (let y = 0; y < rowCol; y++) {
            const cId = y * rowCol + x
            const dx = between * 2 + x * (gridWidth + between)
            const dy = between * 2 + y * (gridHeight + between)
            // grid
            cells.push(rect([dx, dy], [gridWidth, gridHeight]))

            for (let c = 0; c < grids[cId].length; c++) {
                // division
                cuts[cId].map((cut) => {
                    cells.push(
                        line(
                            cut.map((d) => [
                                dx + d[0] * gridWidth,
                                dy + d[1] * gridHeight
                            ])
                        )
                    )
                })
                // label
                const [x, y, w, h] = grids[cId][c]
                const pos = [dx + x * gridWidth, dy + y * gridHeight],
                    siz = [w * gridWidth, h * gridHeight]

                numbers.push(
                    ...getGlyphVector(
                        `${c}`,
                        [txtSize / 2, txtSize / 2],
                        pos.map((d, i) => d + siz[i] / 2 - txtSize / 4)
                    ).map((l) => polyline(l))
                )
            }
        }
    }
    text.forEach((txtLine, y) => {
        txtLine.forEach((letter, x) => {
            if (letter !== ' ') {
                numbers.push(
                    ...getGlyphVector(
                        letter,
                        [txtSize / 2.3, txtSize / 2],
                        [
                            between * 2 + x * (txtSize / 2.3),
                            SIZE[0] * 1.2 + between * y
                        ]
                    ).map((l) => polyline(l))
                )
            }
        })
    })
    comp = group({ stroke: '#333' }, [
        rect(SIZE, { fill: '#fff' }),
        group({ fill: '#00000000', weight: 2 }, cells),
        group({}, numbers)
    ])
    ctx.scale(dpr, dpr)
    draw(ctx, comp)
}

const downloadJPG = () =>
    downloadCanvas(cnvs, `all-grids-${FMT_yyyyMMdd_HHmmss()}`, 'jpeg', 1)

const downloadSVG = () =>
    downloadWithMime(
        `all-grids-${FMT_yyyyMMdd_HHmmss()}.svg`,
        asSvg(
            svgDoc(
                {
                    width: SIZE[0],
                    height: SIZE[1],
                    viewBox: `0 0 ${SIZE[0]} ${SIZE[1]}`
                },
                comp
            )
        ),
        { mime: 'image/svg+xml' }
    )

$compile(canvas('#main')).mount(ROOT)

/* stuff relative to forsaken-ideas */
window.init = init
window.downloadJPG = downloadJPG
window.downloadSVG = downloadSVG
infobox()
handleAction()

init()
