import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { getGlyphVector } from '@nclslbrn/plot-writer'
import { repeatedly, range } from '@thi.ng/transducers'
import { polyline, rect, group, svgDoc, asSvg } from '@thi.ng/geom'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { SYSTEM, pickRandom } from '@thi.ng/random'
import { $compile } from '@thi.ng/rdom'
import { canvas } from '@thi.ng/hiccup-html'
import { adaptDPI, isHighDPI } from '@thi.ng/canvas'
const ROOT = document.getElementById('windowFrame'),
    MUL = 0.66 //(1 + Math.sqrt(5)) / 4

let comp = group(),
    cnvs = null,
    grids = []

const splitCell = (x, y, g, i, variation) => {
    // Get the last or penultimate cell ID
    const splitOn = (g + (x % i)) % variation < variation / 2 ? 'x' : 'y'
    const splitAt = (g + (y % i)) % 2 === 0 ? MUL : 1 - MUL
    const storeRev = (g * i) % 4 === 0

    const toSplit = 0 //grids[g].length - 1
    console.log(toSplit)
    // Get cell to divide property
    console.log(grids.length, g)
    const [cx, cy, cw, ch] = grids[g][toSplit]
    // Based on current iteration choose how to split cell

    const splitted = []
    if (splitOn === 'x') {
        splitted.push(
            ...[
                [cx, cy, cw * splitAt, ch],
                [cx + cw * splitAt, cy, cw * (1 - splitAt), ch]
            ]
        )
    } else {
        splitted.push(
            ...[
                [cx, cy, cw, ch * splitAt],
                [cx, cy + ch * splitAt, cw, ch * (1 - splitAt)]
            ]
        )
    }

    // console.log(`(${x}, ${y}, ${g}/${grids.length}, ${i}) => [${toSplit}] / ${splitOn}`)

    grids[g].splice(toSplit, 1)
    // Based on current grid  choose how to store cells
    if (storeRev) {
        grids[g].push(...splitted.reverse())
    } else {
        grids[g].push(...splitted)
    }
}

const init = () => {
    cnvs = document.getElementById('main')
    // Nothing fancy here we need a context to draw in the canvas
    const ctx = cnvs.getContext('2d')
    const dpr = adaptDPI(cnvs, window.innerWidth, window.innerHeight)
    const variation = 2 // depends of splitCell choices
    const between = 20
    const width = window.innerWidth * dpr
    const height = window.innerHeight * dpr
    const numGrids = variation * 4
    const rowCol = variation * variation
    // init all grid with the first cell (full size)
    grids = [...repeatedly(() => [[0, 0, 1, 1]], numGrids * 2)]
    console.log(grids.length)
    for (let y = 0; y < rowCol; y++) {
        for (let x = 0; x < rowCol; x++) {
            for (let j = 0; j < variation; j++) {
                splitCell(x, y, y * rowCol + x, j, numGrids)
            }
        }
    }
    const gridWidth = (width - between - between * rowCol) / rowCol
    const gridHeight = (height - between - between * rowCol) / rowCol
    const cells = [],
        numbers = []

    for (let y = 0; y < rowCol; y++) {
        for (let x = 0; x < rowCol; x++) {
            const cId = y * rowCol + x
            const dx = between + x * (gridWidth + between)
            const dy = between + y * (gridHeight + between)
            for (let c = 0; c < grids[cId].length; c++) {
                const [x, y, w, h] = grids[cId][c]
                const pos = [dx + x * gridWidth, dy + y * gridHeight],
                    siz = [w * gridWidth, h * gridHeight],
                    mSz = 64
                cells.push(rect(pos, siz))
                numbers.push(
                    ...getGlyphVector(
                        String(c),
                        [mSz / 2, mSz / 2],
                        pos.map((d, i) => d + siz[i] / 2 - mSz / 4)
                    ).map((l) => polyline(l))
                )
            }
        }
    }
    comp = group({ stroke: '#333' }, [
        rect([width, height], { fill: '#fff' }),
        group({ fill: '#00000000' }, cells),
        group({}, numbers)
    ])
    draw(ctx, comp)
}

const downloadJpg = () =>
    downloadCanvas(cnvs, `all-grids-${FMT_yyyyMMdd_HHmmss()}`, 'jpeg', 1)

const downloadSvg = () =>
    downloadWithMime(
        `all-grids-${FMT_yyyyMMdd_HHmmss()}.svg`,
        asSvg(
            svgDoc(
                {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    viewBox: `0 0 ${window.innerWidth} ${window.innerHeight}`
                },
                comp
            )
        ),
        { mime: 'image/svg+xml' }
    )

$compile(canvas('#main')).mount(ROOT)

/* stuff relative to forsaken-ideas */
window.init = init
window.downloadJpg = downloadJpg
window.downloadSvg = downloadSvg
infobox()
handleAction()

init()
