import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { SYSTEM } from '@thi.ng/random'
import { downloadWithMime } from '@thi.ng/dl-asset'
import { group, rect, asSvg, svgDoc } from '@thi.ng/geom'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import { draw } from '@thi.ng/hiccup-canvas'
import * as tome from 'chromotome'
import { generatePolygon } from './generatePolygon'

const dpr = window.devicePixelRatio || 1,
    windowFrame = document.getElementById('windowFrame'),
    loader = document.getElementById('loading'),
    canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d')

let decay = 0,
    margin = [150, 0],
    composition

canvas.width = 1122.52 //window.innerWidth * dpr
canvas.height = 1587.402 //window.innerHeight * dpr * ratio
windowFrame.appendChild(canvas)

const main = () => {
    const palette = tome.get(),
        step = Math.round(SYSTEM.minmax(0.03, 0.1) * canvas.height),
        ground = Math.round(step / SYSTEM.minmax(6, 12)),
        scale = SYSTEM.minmax(0.5, 0.75)

    margin[1] =
        (canvas.height % ((Math.floor(canvas.height / step) - 2) * step)) / 2

    const [polys, lines] = generatePolygon(
        step,
        scale,
        ground,
        margin,
        decay,
        canvas.width,
        canvas.height,
        palette.colors
    )
    composition = group({}, [
        rect([canvas.width, canvas.height], { fill: '#f0f3f2' }),
        group({}, polys),
        group({ stroke: '#333' }, lines)
    ])
    draw(ctx, composition)
    const logColor = {
        sign: palette.colors.map(() => '%c  '),
        style: palette.colors.map((col) => `background: ${col};`)
    }
    console.log(logColor.sign.join(' '), ...logColor.style)
    console.log({ step, ground })
}
main()
windowFrame.removeChild(loader)

window.onresize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    main()
}
window.init = () => {
    decay++
    main()
}
window.download = () =>
    downloadWithMime(
        `NegativeSpace-${FMT_yyyyMMdd_HHmmss()}`,
        asSvg(svgDoc({}, composition)),
        { mime: 'image/svg+xml' }
    )
window.infobox = infobox
handleAction()
