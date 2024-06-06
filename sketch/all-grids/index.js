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

const ROOT = document.getElementById('windowFrame')

let comp = group(),
    cnvs = null,
    grids = []

const splitCell = (num) => {
    const toSplit = num % grids[num].length
    const [x, y, w, h] = grids[num][toSplit]
    const splitOn = num % 2 === 0 ? 'x' : 'y'
    const splitted = []
    if (splitOn === 'x') {
        splitted.push(
            ...[
                [x, y, w * 0.5, h],
                [x + w * 0.5, y, w * 0.5, h]
            ]
        )
    } else {
        splitted.push(
            ...[
                [x, y, w, h * 0.5],
                [x, y + h * 0.5, w, h * 0.5]
            ]
        )
    }
    grids[num].splice(toSplit, 1)
    grids[num].push(...splitted)
}

const init = () => {
    cnvs = document.getElementById('main')
    // Nothing fancy here we need a context to draw in the canvas
    const ctx = cnvs.getContext('2d')
    const dpr = adaptDPI(cnvs, window.innerWidth, window.innerHeight)
    const numGrid = 6
    const between = 20
    const width = window.innerWidth * dpr
    const height = window.innerHeight * dpr

    grids = [...repeatedly(() => [[0, 0, 1, 1]], numGrid * numGrid)]
    //console.log(grids.length, numGrid * numGrid)
    for (let i = 0; i < numGrid * numGrid; i++) {
        splitCell(i)
    }
    const gridWidth = width - (between * 2) / numGrid - between * numGrid
    const gridHeight = height - (between * 2) / numGrid - between * numGrid
    const cells = []

    for (let y = 0; y < numGrid; y++) {
        for (let x = 0; x < numGrid; x++) {
            const cId = y * numGrid + x
            const dx = between + x * (gridWidth + between)
            const dy = between + y * (gridHeight + between)
            for (let c = 0; c < grids[cId].length; c++) {
                const [x, y, w, h] = grids[cId][c]
                cells.push(
                    rect(
                        [dx + x * gridWidth, dy + y * gridHeight],
                        [w * gridWidth, h * gridHeight]
                    )
                )
            }
        }
    }
    comp = group({ stroke: '#333' }, [
        rect([width, height], { fill: '#fff' }),
        ...cells
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
