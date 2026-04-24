import { rect, group, svgDoc, asSvg } from '@thi.ng/geom'
import { pickRandom } from '@thi.ng/random'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import { resolveState } from './state'
import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { convert, mul, quantity, NONE, cm, dpi } from '@thi.ng/units'

const SQUARE_SIZE = quantity([40, 40], cm),
    DPI = quantity(96, dpi), // default settings in inkscape
    SIZE = mul(SQUARE_SIZE, DPI).deref(),
    MARGIN = convert(mul(quantity(1.5, cm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d')

let drawElems

ROOT.appendChild(CANVAS)
const randColor = () =>
    pickRandom(['tomato', 'steelblue', 'limegreen', 'indigo', 'gold'])

const init = () => {
    const STATE = resolveState({
        width: SIZE[0],
        height: SIZE[1],
        margin: MARGIN
    })
    console.log(STATE)
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]

    const { groupedElems } = STATE

    draw(
        CTX,
        group({}, [
            rect(SIZE, { fill: '#111' }),
            ...groupedElems.map((elems) => group({}, elems))
        ])
    )
}

init()
window.init = init

window['exportJPG'] = () => {
    downloadCanvas(CANVAS, `Grid-rules-${FMT_yyyyMMdd_HHmmss()}`, 'jpeg', 1)
}
window['exportSVG'] = () => {
    downloadWithMime(
        `Grid-rules-${FMT_yyyyMMdd_HHmmss()}.svg`,
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
