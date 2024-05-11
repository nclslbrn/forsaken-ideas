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
import {
    skewXY33,
    skewX22,
    transform44,
    transform23,
    translation23,
    skewX23,
    mulV23,
    skewXY44,
    shearXZ33,
    shearX22,
    shearX23,
    skewY23,
    shearY23,
    mul23,
    mulM23,
    mat23v
} from '@thi.ng/matrices'

const ROOT = document.getElementById('windowFrame'),
    canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d'),
    textStyle = {
        lineJoin: 'round',
        lineCap: 'round',
        stroke: '#333',
        fill: 'rgba(0,0,0,0)',
        weight: 1.25
    },
    bgStyle = { fill: '#ffecea' },
    SENTENCES = [
        "no it's fine ",
        'so far so good ',
        'a picture of ',
        'it happens again ',
        'undefined is ',
        "isNaN('Goldin') ",
        '[____]|'
    ],
    ALT_TEXT = [
        '/\\-|-|',
        '////L__',
        '#------',
        '*-^-^-^-',
        'L____n ',
        'NNZNNNN'
    ],
    EMPTY_CHANCE = 0.25,
    INTERPO_CHANCE = 0.5

let signs, width, height, margin, chars

ROOT.appendChild(canvas)

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
                rows
            )
        ]
    return grid.flat()
}
// Return from a rectangle a trapeze for interpolate points/letters
const trapeze = (x, y, w, h, d) => {
    const type = SYSTEM.minmaxInt(0, 3)
    console.log(type)
    if (type === 0) {
        return [
            [x, y],
            [x + w - d, y + d],
            [x + w - d, y + h - d],
            [x, y + h]
        ]
    } else if (type === 1) {
        return [
            [x, y],
            [x + w, y],
            [x + w - d, y + h - d],
            [x + d, y + h - d]
        ]
    } else if (type === 2) {
        return [
            [x + d, y + d],
            [x + w, y],
            [x + w, y + h],
            [x + d, y + h - d]
        ]
    } else if (type === 3) {
        return [
            [x + d, y + d],
            [x + w - d, y + d],
            [x + w, y + h],
            [x, y + h]
        ]
    }
}
const init = () => {
    margin = Math.hypot(window.innerWidth, window.innerHeight) * 0.05
    width = window.innerWidth - margin * 2
    height = window.innerHeight - margin * 2
    signs = []
    chars = [[...pickRandom(SENTENCES)], [...pickRandom(ALT_TEXT)]]

    const d = margin * 0.2

    const _e = {
        x: (v) => v * width,
        y: (v) => v * height
    }

    const yRange = stack(SYSTEM.minmaxInt(6, 12))
    let y = 0
    for (let i = 0; i < yRange.length; i++) {
        const dy = _e.y(yRange[i])
        const xRange = stack(SYSTEM.minmaxInt(6, 12))
        let x = 0

        for (let j = 0; j < xRange.length; j++) {
            const dx = _e.x(xRange[j])
            // let some empty cell
            if (SYSTEM.float() > EMPTY_CHANCE) {
                const sx = margin + x,
                    sy = margin + y,
                    c = chars[SYSTEM.float() > 0.25 ? 0 : 1]

                if (SYSTEM.float() > INTERPO_CHANCE) {
                    signs.push(
                        ...fillPart(c, sx, sy, dx, dy, d).map((pts) =>
                            polyline(pts)
                        )
                    )
                }
                // Anamorphic alteration of the glyphs
                else {
                    const glyphs = fillPart(c, 0, 0, dx, dy, d),
                        theta = (Math.PI / 4) * (j % 2 === 0 ? 1 : -1)
                    //[t1, t2, t3, t4] = trapeze(sx, sy, dx, dy, d)

                    signs.push(
                        ...glyphs.map((line) =>
                            transform(
                                polyline(line),
                                mulM23(
                                    null,
                                    //mat23v(t1, t2, t3, t4)

                                    translation23(null, [sx, sy]),
                                    skewY23(null, theta),
                                    shearY23(null, theta)
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
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    draw(
        ctx,
        group({}, [
            rect([window.innerWidth, window.innerHeight], bgStyle),
            group(textStyle, signs)
        ])
    )
}

init()
window.init = init

window['capture'] = () => {
    downloadCanvas(canvas, `block-type${FMT_yyyyMMdd_HHmmss()}`, 'jpeg', 1)
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
                    rect([window.innerWidth, window.innerHeight], bgStyle),
                    group(textStyle, signs)
                ])
            )
        )
    )
}
window.infobox = infobox
handleAction()
