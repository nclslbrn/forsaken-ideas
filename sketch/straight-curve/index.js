import '../framed-canvas.css'
// import sketch from './straight-curve'
// import p5 from 'p5'
// const containerElement = document.getElementById('windowFrame')
// const loader = document.getElementById('loading')

import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { rect, triangle, polyline, group, svgDoc, asSvg } from '@thi.ng/geom'
import { pickRandom } from '@thi.ng/random'
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

const init = () => {
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]

    const minMax = [0.01, 0.1],
        incr = 0.01

    let variation = [
            (random() > 0.5 ? -1 : 1) * 0.1,
            (random() > 0.5 ? -1 : 1) * 0.1
        ],
        step = [randMinMax(minMax), randMinMax(minMax)]

    console.log(step)
    const updateVariation = (x) => {
        if (x < minMax[0] || x > minMax[1]) {
            return x * -1
        }
        return x + x
    }
    const cellWidth = [],
        cellHeight = []
    let x = 0,
        y = 0

    while (x < 1) {
        variation[0] = updateVariation(variation[0])
        step += variation[0]
        cellWidth.push(step)
        x += step
    }

    console.log(cellWidth)
}

init()
window.init = init

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
                group({}, drawElems)
            )
        )
    )
}

window.infobox = infobox
handleAction()
