import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { rect, triangle, polyline, group, svgDoc, asSvg } from '@thi.ng/geom'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import { draw } from '@thi.ng/hiccup-canvas'
import { convert, mul, quantity, NONE, mm, dpi, DIN_A3 } from '@thi.ng/units'

const APP = document.getElementById('windowFrame'),
    LOADER = document.getElementById('loading'),
    DPI = quantity(96, dpi),
    CUSTOM_FORMAT = quantity([216, 270], 'mm'),
    SIZE = mul(CUSTOM_FORMAT, DPI).deref(),
    MARGIN = convert(mul(quantity(20, mm), DPI), NONE),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    { random, floor, ceil } = Math,
    randMinMax = (minMax) => minMax[0] + random() * (minMax[1] - minMax[0])

APP.removeChild(LOADER)
APP.appendChild(CANVAS)

let drawElems

const init = () => {
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]

    const dimVariation = (minMax) => {
            const dimSize = []
            let x = 0,
                step = randMinMax(minMax),
                isStepGrowing = random() > 0.5

            while (x < 1) {
                if (step >= minMax[1]) isStepGrowing = false
                if (step <= minMax[0]) isStepGrowing = true
                if (isStepGrowing) step *= 1.1
                else step *= 0.9

                dimSize.push(step)
                x += step
            }
            const fixScale = dimSize.reduce((acc, val) => (acc += val), 0)
            return dimSize.map((x) => (x /= fixScale))
        },
        cellWidth = dimVariation([0.02, 0.04]),
        cellHeight = dimVariation([0.01, 0.05]),
        tris = []

    let x = 0
    for (const w of cellWidth) {
        let y = 0
        for (const h of cellHeight) {
            tris.push(
                triangle(
                    [x, y],
                    [x + w * SIZE[0], y + h * SIZE[1]],
                    [x, y + h * SIZE[1]]
                )
            )
            y += h * SIZE[1]
        }
        x += w * SIZE[0]
    }

    drawElems = [rect(SIZE, { fill: '#111' }), group({ fill: '#fefefe' }, tris)]
    draw(CTX, group({}, drawElems))
}

init()
window.init = init

window['exportJPG'] = () => {
    downloadCanvas(
        CANVAS,
        `Straight curve - ${FMT_yyyyMMdd_HHmmss()}`,
        'jpeg',
        1
    )
}
window['exportSVG'] = () => {
    downloadWithMime(
        `Straight curve - ${FMT_yyyyMMdd_HHmmss()}.svg`,
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
