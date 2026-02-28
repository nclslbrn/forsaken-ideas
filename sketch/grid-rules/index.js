// import '../full-canvas.css'
// import '../framed-canvas.css'

import './style.css'
import { rect, group, svgDoc, asSvg, polyline, line } from '@thi.ng/geom'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { convert, mul, quantity, NONE, cm, dpi, DIN_A3 } from '@thi.ng/units'
import {
    getRandSeed,
    saveSeed,
    cleanSavedSeed
} from '../../sketch-common/random-seed'
import { cartelContent } from './cartel'

// import { scribbleLine } from './scribbleLine'

import { iterMenu } from './iter-menu'
import { resolveState } from './state'

const DPI = quantity(96, dpi),
    // F_9_16 = quantity([60.7, 108], cm),
    // IG_SQ = quantity([40, 40], cm),
    // CUSTOM_FORMAT = quantity([50, 50], 'cm'),
    SIZE = mul(DIN_A3, DPI).deref(),
    MARGIN = convert(mul(quantity(3, cm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    ITER_LIST = document.createElement('div')

let seed, STATE

const init = async () => {
    if (!seed) return

    STATE = resolveState({
        width: SIZE[0],
        height: SIZE[1],
        margin: MARGIN,
        seed
    })
    // console.log(STATE)
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]
    console.log(STATE)
    const { theme, groupedElems, cartel } = STATE
    const [pattern, rule, gridSize, rotation, skew, areCellsDupplicated] =
        cartel.map(([param, cell], i) => cartelContent(STATE, param, cell, i))

    draw(
        CTX,
        group({}, [
            rect(SIZE, { fill: theme[1][0] }),
            ...groupedElems,
            group({ stroke: theme[1][1] }, [
                ...pattern,
                ...gridSize,
                ...rule,
                ...rotation,
                ...skew,
                ...areCellsDupplicated,
                ...cartel.map(([__dirname, cell]) =>
                    line([cell[0], cell[1]], [cell[0] + cell[2], cell[1]])
                )
            ])
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
    const [pattern, rule, gridSize, rotation, skew, areCellsDupplicated] =
        STATE.cartel.map(([param, cell], i) =>
            cartelContent(STATE[param], cell, i)
        )
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
                    ...STATE.groupedElems,
                    group({ stroke: STATE.theme[1][1] }, [
                        ...pattern,
                        ...gridSize
                        /*
                            ...cartel.map(([__dirname, cell]) =>
                                rect([cell[0], cell[1]], [cell[2], cell[3]])
                            )
                            */
                    ]),
                    group(
                        {
                            font: `14px monospace`,
                            align: 'center',
                            baseline: 'middle',
                            fill: STATE.theme[1][1]
                        },
                        [rule, rotation, skew, areCellsDupplicated]
                    )
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
