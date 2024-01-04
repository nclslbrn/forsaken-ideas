import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadWithMime, downloadCanvas } from '@thi.ng/dl-asset'
import { group, rect, asSvg, svgDoc } from '@thi.ng/geom'
// import { convertTree } from '@thi.ng/hiccup-svg'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import { draw } from '@thi.ng/hiccup-canvas'
import { getPalette } from '@nclslbrn/artistry-swatch'
import { resolveState } from './api'
import { generatePolygon } from './generatePolygon'

const windowFrame = document.getElementById('windowFrame'),
    loader = document.getElementById('loading'),
    canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d'),
    urlParams = new URLSearchParams(window.location.search),
    plotMode = urlParams.get('mode') === 'plotter'

let STATE, palette, svg

windowFrame.appendChild(canvas)
/*
if (plotMode) {
    windowFrame.style.overflowY = 'auto'
    document.documentElement.style.overflowY = 'auto'
    document.body.style.overflowY = 'auto'
}
*/
const init = () => {
    STATE = resolveState({
        mode: plotMode ? 'plotter' : 'browser',
        width: plotMode ? 1122.52 : window.innerWidth,
        height: plotMode ? 1587.402 : window.innerHeight
    })
    console.log(
        'Mode ',
        plotMode ? 'plotter' : 'browser',
        STATE.width,
        STATE.height
    )
    palette = getPalette()

    canvas.width = STATE.width
    canvas.height = STATE.height
    STATE.decay++
    main()
}

const main = () => {
    const [polys, lines] = generatePolygon(STATE, palette.colors)
    const composition = group({}, [
        rect([STATE.width, STATE.height], {
            fill: palette.background || '#111'
        }),
        group({}, polys),
        group({ stroke: palette.stroke || '#222' }, lines)
    ])
    svg = asSvg(
        svgDoc(
            {
                width: STATE.width,
                height: STATE.height,
                viewBox: `0 0 ${STATE.width} ${STATE.height}`
            },
            composition
        )
    )
    draw(ctx, composition)
    const logColor = {
        sign: palette.colors.map(() => '%c  '),
        style: palette.colors.map((col) => `background: ${col};`)
    }
    console.log(logColor.sign.join(' '), ...logColor.style)
    console.table({
        step: STATE.step,
        ground: STATE.ground,
        mode: STATE.mode,
        variation: STATE.variation.label,
        lines: STATE.numBands,
        'Line section spacing': STATE.varyingLinespacing
            ? 'random between 4 and 8'
            : '4',
        'Tick spacing': STATE.tickSpacing,
        'noise scale': STATE.scale
    })
}

init()
windowFrame.removeChild(loader)
window.onresize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    main()
}
window.init = init
window.download_SVG = () =>
    downloadWithMime(`NegativeSpace-${FMT_yyyyMMdd_HHmmss()}`, svg, {
        mime: 'image/svg+xml',
        utf8: true
    })
window.download_JPG = () =>
    downloadCanvas(canvas, `NegativeSpace-${FMT_yyyyMMdd_HHmmss()}`, 'jpeg')

document.onkeydown = () => {
    console.log(JSON.stringify(palette))
}
window.infobox = infobox
handleAction()
