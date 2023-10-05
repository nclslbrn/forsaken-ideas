import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { SYSTEM, pickRandom } from '@thi.ng/random'
import { downloadWithMime } from '@thi.ng/dl-asset'
import { group, rect, line, asSvg, svgDoc } from '@thi.ng/geom'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import { draw } from '@thi.ng/hiccup-canvas'
import * as tome from 'chromotome'
import { generateRect } from './generateRect'
import { generatePolygon } from './generatePolygon'

const dpr = window.devicePixelRatio || 1,
    windowFrame = document.getElementById('windowFrame'),
    loader = document.getElementById('loading'),
    canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d'),
    margin = 50

let decay = 0,
    composition

canvas.width = window.innerWidth * dpr
canvas.height = window.innerHeight * dpr
windowFrame.appendChild(canvas)

const main = () => {
    const palette = tome.get(),
        step = Math.round(SYSTEM.minmax(0.03, 0.07) * canvas.height),
        ground = Math.round(step / SYSTEM.minmax(0, 2)),
        scale = SYSTEM.minmax(0.5, 0.75),
        rectPerColRow = Math.round(SYSTEM.minmaxInt(8, 24) / 2) * 2 + 1,
        factor = pickRandom([3, 5, 6, 7, 9, 10, 11, 12, 13, 15]),
        rects = generateRect(
            rectPerColRow,
            margin,
            canvas.width,
            canvas.height
        ),
        polys = generatePolygon(
            rects,
            step,
            scale,
            ground,
            margin,
            decay,
            canvas.width,
            canvas.height,
            palette.colors
        ),
        lines = []

    rects.forEach((r, i) => {
        if (i % 2 !== 0) {
            const d = Math.round(SYSTEM.minmaxInt(4, 8) / 2) * 4
            if (SYSTEM.float() > 0.5) {
                for (let x = r.pos[0]; x < r.pos[0] + r.size[0]; x += d) {
                    lines.push(line([x, r.pos[1]], [x, r.pos[1] + r.size[1]]))
                }
            } else {
                for (let y = r.pos[1]; y < r.pos[1] + r.size[1]; y += d) {
                    lines.push(line([r.pos[0], y], [r.pos[0] + r.size[0], y]))
                }
            }
        }
    })

    composition = group({}, [
        rect([canvas.width, canvas.height], { fill: '#f0f3f2' }),
        /* group(
            { fill: '#00000033' },
            rects.filter((r, i) => i % 2 === 0)
        ),*/
        group({ stroke: '#333' }, lines),
        group({}, polys)
    ])
    draw(ctx, composition)

    console.log({ step, factor, rectPerColRow, ground })
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