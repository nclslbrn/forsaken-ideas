import { rect, group, svgDoc, asSvg } from '@thi.ng/geom'
import { pickRandom } from '@thi.ng/random'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw, polyline } from '@thi.ng/hiccup-canvas'
import { convert, mul, quantity, NONE, mm, dpi, DIN_A3 } from '@thi.ng/units'
import { SFC32 } from '@thi.ng/random'
import { getRandSeed } from '../../sketch-common/random-seed'
import { seedFromHash } from '../grid-on-grid/seed-from-hash'
import Walker from './Walker'

const DPI = quantity(96, dpi), // default settings in inkscape
    SIZE = mul(DIN_A3, DPI).deref(),
    MARGIN = convert(mul(quantity(15, mm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    PARAMS = new URLSearchParams(window.location.search)

/* Live params (to compute) */
let RND, seed, width, height, drawElems

ROOT.appendChild(CANVAS)

const init = () => {
    if (PARAMS.has('seed')) {
        seed = PARAMS.get('seed')
    } else {
        seed = getRandSeed()
    }
    RND = new SFC32(seedFromHash(seed))
    width = SIZE[0] - MARGIN * 2
    height = SIZE[1] - MARGIN * 2
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]

    // create generative things here
    const walkerSpawnPos = SIZE.map((d) => Math.floor(MARGIN + RND.float() * d))
    const isPointIn = ([x, y]) =>
        Math.min(x, y) > MARGIN && x < SIZE[0] - MARGIN && y < SIZE[1] - MARGIN

    const walkerPathStep = Math.ceil(RND.float() * 16)

    const walker = new Walker(
        walkerSpawnPos,
        walkerPathStep,
        isPointIn,
        walkerPathStep,
        () => RND.float()
    )
    // Walk synchronnously until end
    walker.walk()
    console.log(walker.path)

    drawElems = [
        rect(SIZE, { fill: '#EEE' }),
        polyline(walker.path, { fill: '#333' })
        // and place them in a group()
    ]

    draw(CTX, group({}, drawElems))
}

const updateUrl = () => {
    const url = new URL(window.location.href)
    url.searchParams.set('seed', seed)
    url.searchParams.set('folds', folds)
    window.history.replaceState(null, '', url)
}

init()
window.init = init

window['exportJPG'] = () => {
    downloadCanvas(CANVAS, `Walker is back-${FMT_yyyyMMdd_HHmmss()}`, 'jpeg', 1)
}
window['exportSVG'] = () => {
    downloadWithMime(
        `Walker is back-${FMT_yyyyMMdd_HHmmss()}.svg`,
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
