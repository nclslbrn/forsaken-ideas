import { rect, group, svgDoc, polyline, asSvg, transform } from '@thi.ng/geom'
import { SYSTEM, pickRandom } from '@thi.ng/random'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { getGlyphVector } from './plotWriter'
import { repeatedly2d } from '@thi.ng/transducers'
import * as mat from '@thi.ng/matrices'
import { SENTENCES } from './SENTENCES'
import { ALT_TEXT } from './ALT_TEXT'

const ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    TXT_ST = {
        lineJoin: 'round',
        lineCap: 'round',
        stroke: '#333',
        fill: 'rgba(0,0,0,0)',
        weight: 1.25
    },
    BG_ST = { fill: '#ffecea' },
    EMPTY_CHANCE = 0.16,
    INTERPO_CHANCE = 0.33

let signs, width, height, margin, chars

ROOT.appendChild(CANVAS)

// Return an array of {num} element with the sum equals 1
const stack = (num) => {
    let o = []
    for (let i = 0; i < num; i++) {
        o.push(SYSTEM.float())
    }
    const sum = o.reduce((a, v) => a + v)
    return o.map((v) => v / sum)
}

// Fill a cell with text
const fillPart = (text, x, y, w, h, b) => {
    const cols = Math.floor(w / b),
        rows = Math.floor(h / b),
        grid = [
            ...repeatedly2d(
                (i, j) =>
                    getGlyphVector(
                        text[(i + cols * j) % text.length],
                        [b, b],
                        [x + i * b, y + j * b]
                    ),
                cols,
                rows-1
            )
        ]
    return grid.flat()
}

const init = () => {
    margin = Math.hypot(window.innerWidth, window.innerHeight) * 0.05
    width = window.innerWidth - margin * 2
    height = window.innerHeight - margin * 2
    signs = []
    chars = [[...pickRandom(SENTENCES)], [...pickRandom(ALT_TEXT)]]

    const d = margin * 0.15

    const _e = {
        x: (v) => v * width,
        y: (v) => v * height
    }

    const yRange = stack(SYSTEM.minmaxInt(8, 16))
    let y = 0
    for (let i = 0; i < yRange.length; i++) {
        const dy = _e.y(yRange[i])
        const xRange = stack(SYSTEM.minmaxInt(8, 18))
        let x = 0

        for (let j = 0; j < xRange.length; j++) {
            const dx = _e.x(xRange[j])
            // let some empty cell
            if (SYSTEM.float() > EMPTY_CHANCE) {
                const sx = margin + x,
                    sy = margin + y,
                    c = chars[SYSTEM.float() > 0.25 ? 0 : 1]

                if (
                    SYSTEM.float() > INTERPO_CHANCE ||
                    i === 0 ||
                    i === yRange.length - 1 ||
                    j === 0 ||
                    j === xRange.length - 1
                ) {
                    signs.push(
                        ...fillPart(c, sx, sy, dx, dy, d).map((pts) =>
                            polyline(pts)
                        )
                    )
                }
                // Anamorphic alteration of the glyphs
                else {
                    const asc = j % 2 === 0,
                        glyphs = fillPart(c, 0, 0, dx, dy, d),
                        theta = (Math.PI / 8) * (asc ? 1 : -1)
                                        
                    signs.push(
                        ...glyphs.map((line) =>
                            transform(
                                polyline(line),
                                
                                mat.concat(
                                    [], 
                                    mat.translation23(null, [sx, sy]),
                                    mat.skewY23(null, theta),
                                )
                            )
                        )
                    )
                }
            }
            x += dx
        }
        y += dy
    }
    CANVAS.width = window.innerWidth
    CANVAS.height = window.innerHeight
    draw(
        CTX,
        group({}, [
            rect([window.innerWidth, window.innerHeight], BG_ST),
            group(TXT_ST, signs)
        ])
    )
}

init()
window.init = init

window['capture'] = () => {
    downloadCanvas(CANVAS, `block-type${FMT_yyyyMMdd_HHmmss()}`, 'jpeg', 1)
}

window['export_svg'] = () => {
    downloadWithMime(
        `block-type${FMT_yyyyMMdd_HHmmss()}.svg`,
        asSvg(
            svgDoc(
                {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    viewBox: `0 0 ${window.innerWidth} ${window.innerHeight}`
                },
                group({}, [
                    rect([window.innerWidth, window.innerHeight], BG_ST),
                    group(TXT_ST, signs)
                ])
            )
        )
    )
}
window.infobox = infobox
handleAction()
