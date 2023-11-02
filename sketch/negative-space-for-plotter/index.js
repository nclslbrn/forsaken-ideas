import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { SYSTEM } from '@thi.ng/random'
import { downloadWithMime, downloadCanvas } from '@thi.ng/dl-asset'
import { group, rect, asSvg, svgDoc } from '@thi.ng/geom'
// import { convertTree } from '@thi.ng/hiccup-svg'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import { draw } from '@thi.ng/hiccup-canvas'
import * as tome from 'chromotome'
import { generatePolygon } from './generatePolygon'

const dpr = window.devicePixelRatio || 2,
    windowFrame = document.getElementById('windowFrame'),
    loader = document.getElementById('loading'),
    canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d'),
    urlParams = new URLSearchParams(window.location.search),
    plotMode = urlParams.get('mode') === 'plotter'

let decay = 1,
    margin = [plotMode ? 200 : 100, 0],
    palette,
    svg

canvas.width = plotMode ? 1122.52 : window.innerWidth * dpr
canvas.height = plotMode ? 1587.402 : window.innerHeight * dpr
windowFrame.appendChild(canvas)
if (plotMode) {
    windowFrame.style.overflowY = 'auto'
    document.documentElement.style.overflowY = 'auto'
    document.body.style.overflowY = 'auto'
}

const main = () => {
    const step = Math.round(SYSTEM.minmax(0.05, 0.08) * canvas.height),
        ground = Math.round(step / SYSTEM.minmax(10, 16)),
        scale = SYSTEM.minmax(0.07, 0.1)

    margin[1] =
        margin[0] +
        (canvas.height % ((Math.floor(canvas.height / step) - 2) * step)) / 2

    palette = tome.get()

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
    const composition = group({}, [
        rect([canvas.width, canvas.height], { fill: '#f0f3f2' }),
        group({}, polys),
        group({ stroke: '#111' }, lines)
    ])
    svg = asSvg(svgDoc({}, composition))
    draw(ctx, composition)
    const logColor = {
        sign: palette.colors.map(() => '%c  '),
        style: palette.colors.map((col) => `background: ${col};`)
    }
    console.log(logColor.sign.join(' '), ...logColor.style)
    console.log({ step, ground, mode: plotMode ? 'plotter' : 'browser' })
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
window.download_SVG = () =>
    downloadWithMime(`NegativeSpace-${FMT_yyyyMMdd_HHmmss()}`, svg, {
        mime: 'image/svg+xml',
        utf8: true
    })
window.download_JPG = () =>
    downloadCanvas(canvas, `NegativeSpace-${FMT_yyyyMMdd_HHmmss()}`, 'jpeg')

document.onkeydown = () => {
    console.log(JSON.stringify(palette.colors))
}
window.infobox = infobox
handleAction()
