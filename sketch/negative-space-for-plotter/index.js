import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { SYSTEM, pickRandom } from '@thi.ng/random'
import { downloadWithMime } from '@thi.ng/dl-asset'
import { group, rect, polygon, asSvg, svgDoc } from '@thi.ng/geom'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import { draw } from '@thi.ng/hiccup-canvas'
import * as tome from 'chromotome'
import { createNoise2D } from 'simplex-noise'

const dpr = window.devicePixelRatio || 1,
    windowFrame = document.getElementById('windowFrame'),
    loader = document.getElementById('loading'),
    canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d'),
    margin = 50

let composition

canvas.width = window.innerWidth * dpr
canvas.height = window.innerHeight * dpr
windowFrame.appendChild(canvas)

const main = () => {
    const palette = tome.get()
    const noise2D = createNoise2D()
    const step = SYSTEM.minmaxInt(1, 5) * 20
    const polys = []

    for (let y = margin; y < canvas.height - margin; y += step) {
        const top = [],
            bottom = []
        for (let x = margin; x < canvas.width - margin; x += 4) {
            const n1 = noise2D((x / canvas.height) * step, 10)
            const n2 = noise2D((y / canvas.height) * step, 10)
            const p1 = [x, y + n1 * step * 0.25]
            const p2 = [x, y + n2 * step * 0.25]

            if (p1[1] < p2[1]) {
                top.push(p1)
                bottom.push(p2)
            } else {
                top.push(p2)
                bottom.push(p1)
            }
        }
        polys.push(
            polygon([...top, ...bottom.reverse()], {
                fill: pickRandom(palette.colors),
                stroke: '#333'
            })
        )
    }
    composition = group({}, [
        rect([canvas.width, canvas.height], { fill: '#f0f3f2' }),
        group({}, polys)
    ])

    draw(ctx, composition)
}
windowFrame.removeChild(loader)
main()

window.onresize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    main()
}
window.init = main
window.download = () =>
    downloadWithMime(
        `NegativeSpace-${FMT_yyyyMMdd_HHmmss()}`,
        asSvg(svgDoc({}, composition)),
        { mime: 'image/svg+xml' }
    )
window.infobox = infobox
handleAction()
