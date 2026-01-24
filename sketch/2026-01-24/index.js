import { rect, group, svgDoc } from '@thi.ng/geom'
import { pickRandom } from '@thi.ng/random'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import { resolveState } from './state'
import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { convert, mul, quantity, NONE, mm, dpi, DIN_A3 } from '@thi.ng/units'

const DPI = quantity(96, dpi), // default settings in inkscape
    SIZE = mul(DIN_A3, DPI).deref(),
    MARGIN = convert(mul(quantity(15, mm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d')

let width, height, drawElems

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
            rect(SIZE, { fill: '#222' }),
            ...groupedElems.map((elems) => group({}, elems))
        ])
    )
}

init()
window.init = init

window['exportJPG'] = () => {
    downloadCanvas(CANVAS, `2026 01 24-${FMT_yyyyMMdd_HHmmss()}`, 'jpeg', 1)
}
window['exportSVG'] = () => {
    downloadWithMime(
        `2026 01 24-${FMT_yyyyMMdd_HHmmss()}.svg`,
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
