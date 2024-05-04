import { rect, group, svgDoc, asSvg, pathFromSvg } from '@thi.ng/geom'
import { SYSTEM, pickRandom } from '@thi.ng/random'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { getGlyphPath } from './plotWriter'
import { repeatedly2d } from '@thi.ng/transducers'

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
        'isNaN(\'Goldin\') ',
        'TypeError: Art is not an object ',
        'Is art always political ? ',
        'until it reach another bug ',
        '[____]|'
    ],
    ALT_TEXT = [
      '/\\-|-|',
      '////L__',
      '#------',
      '*-^-^-^-',
      'L____n ',
      'NNZNNNN'
    ]

let signs, width, height, margin, chars

ROOT.appendChild(canvas)

const stack = (num) => {
    let o = []
    for (let i = 0; i < num; i++) {
        o.push(SYSTEM.float())
    }
    const sum = o.reduce((a, v) => a + v)
    return o.map((v) => v / sum)
}

const fillPart = (text, x, y, w, h, b) => {
    const cols = Math.floor(w / b),
        rows = Math.floor(h / b),
        grid = [
            ...repeatedly2d(
                (i, j) =>
                    getGlyphPath(
                        text[(i + cols * j) % text.length],
                        [b, b],
                        [x + i * b, y + j * b]
                    ),
                cols,
                rows
            )
        ]
    return grid.flat().reduce((acc, d) => [...acc, ...pathFromSvg(d)], [])
}

const init = () => {
    margin = Math.hypot(window.innerWidth, window.innerHeight) * 0.05
    width = window.innerWidth - margin * 2
    height = window.innerHeight - margin * 2
    signs = []
    chars = [
      [...pickRandom(SENTENCES)],
      [...pickRandom(ALT_TEXT)],   
    ]
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
            if (SYSTEM.float() > 0.25) {
                signs.push(
                    ...fillPart(
                        chars[SYSTEM.float() > 0.25 ? 0 : 1],
                        margin + x,
                        margin + y,
                        dx,
                        dy,
                        margin * 0.2
                    )
                )
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
window.onresize = init

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
