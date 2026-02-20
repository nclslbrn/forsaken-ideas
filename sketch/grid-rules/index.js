// import '../full-canvas.css'
// import '../framed-canvas.css'

import './style.css'
import { rect, group, svgDoc, asSvg } from '@thi.ng/geom'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { convert, mul, quantity, NONE, mm, dpi, DIN_A3 } from '@thi.ng/units'
import {
    getRandSeed,
    saveSeed,
    cleanSavedSeed
} from '../../sketch-common/random-seed'
import { getParagraphPath } from '@nclslbrn/plot-writer'
// import { scribbleLine } from './scribbleLine'

import { iterMenu } from './iter-menu'
import { resolveState } from './state'

const DPI = quantity(96, dpi),
    CUSTOM_FORMAT = quantity([50, 50], 'cm'),
    SIZE = mul(CUSTOM_FORMAT, DPI).deref(),
    MARGIN = convert(mul(quantity(120, mm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    ITER_LIST = document.createElement('div')

let seed,
    STATE,
    groupedElems = []

const init = async () => {
    if (!seed) return

    STATE = resolveState({
        width: SIZE[0],
        height: SIZE[1],
        margin: MARGIN,
        seed
    })
    console.log(STATE)
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]

    const { theme, groupedElems, edMeta } = STATE

    draw(
        CTX,
        group({}, [
            rect(SIZE, { fill: theme[1][0] }),
            ...groupedElems.map((elems, i) =>
                group({ stroke: theme[1][0] }, elems)
            )
            // group({ stroke: theme[1][1], fill: '#00000000', weight: 2 }, edMeta)
        ])
    )
}

// document.getElementById('iconav').style.display = 'none'

window['init'] = () => {
    seed = getRandSeed()
    init()
}

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
                group({}, [
                    rect(SIZE, { fill: STATE.theme[1][0] }),
                    ...STATE.groupedElems.map((elems) =>
                        group({ fill: STATE.theme[1][1] }, elems)
                    ),
                    group({ stroke: STATE.theme[1][1] }, STATE.edMeta)
                ])
            )
        )
    )
}
document.addEventListener('keypress', (e) => {
    switch (e.key) {
        case 'r':
            seed = getRandSeed()
            init()
            break

        case 'd':
            window.exportJPG()
            break

        case 'v':
            window.exportSVG()
            break

        case 's':
            saveSeed(seed)
            iterMenu(ITER_LIST, STATE)
            break

        case 'c':
            cleanSavedSeed()
            iterMenu(ITER_LIST, STATE)
            break
    }
})
const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
if (urlParams.has('seed')) {
    seed = urlParams.get('seed')
} else {
    seed = getRandSeed()
}
window.infobox = infobox

ROOT.removeChild(document.getElementById('loading'))
ROOT.appendChild(CANVAS)
ROOT.appendChild(ITER_LIST)
init()
iterMenu(ITER_LIST, STATE)
handleAction()
