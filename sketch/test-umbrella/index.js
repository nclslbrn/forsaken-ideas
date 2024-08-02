import { rect, group, svgDoc } from '@thi.ng/geom'
import { SYSTEM, pickRandom } from '@thi.ng/random'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { convert, mul, quantity, NONE, mm, dpi, DIN_A4, DIN_A3 } from '@thi.ng/units'

const DPI = quantity(96, dpi), // default settings in inkscape
    SIZE = mul(DIN_A4, DPI).deref(),
    MARGIN = convert(mul(quantity(15, mm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d')

ROOT.appendChild(CANVAS)


const init = () => {
    width = SIZE[0] - MARGIN * 2
    height = SIZE[1] - MARGIN * 2
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]
    const bg = pickRandom(['tomato', 'steelblue', 'limegreen', 'indigo', 'gold'])
    // create generative things here

    draw(
        CTX,
        group({}, [
            rect(SIZE, bg),
            // and place them in a group()
        ])
    )
}

init()
window.init = init

window['capture'] = () => {
    downloadCanvas(CANVAS, `{{title}}-${FMT_yyyyMMdd_HHmmss()}`, 'jpeg', 1)
}

window['export_svg'] = () => {
    downloadWithMime(
        `block-type${FMT_yyyyMMdd_HHmmss()}.svg`,
        asSvg(
            svgDoc(
                {
                    width: SIZE[0],
                    height: SIZE[1],
                    viewBox: `0 0 ${SIZE[0]} ${SIZE[1]}`
                },
                group({}, [
                    rect(SIZE, BG_ST),
                    group(TXT_ST, signs)
                ])
            )
        )
    )
}
window.infobox = infobox
handleAction()
