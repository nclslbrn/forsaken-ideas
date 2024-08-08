import {
    rect,
    quad,
    group,
    svgDoc,
    ellipse,
    polyline,
    warpPoints,
    asSvg
} from '@thi.ng/geom'
import { SYSTEM } from '@thi.ng/random'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { repeatedly2d } from '@thi.ng/transducers'
import { dist } from '@thi.ng/vectors'
import { convert, mul, quantity, NONE, mm, dpi } from '@thi.ng/units'
import { createNoise2D } from 'simplex-noise'
import { getGlyphVector } from '@nclslbrn/plot-writer'
import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import sortClockwise from './sortClockwise'
import hatch from './hatch'
// default settings in inkscape DPI = 96
const DPI = quantity(200, dpi),
    SIZE = mul(quantity([336, 420], mm), DPI).deref(),
    MARGIN = convert(mul(quantity(25, mm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    STEP = 118,
    SENTENCES = 'structure'
    /*
    'X↑↓O←→─│'
    '─│┌┐└┘├┤┬┴┼╌╎'
      '↖←↑→↓↖↗↘↙↔↕↰↱↲↳↴↵'
      'AreYouOK?'
    */
let width, height, drawElems, noise

ROOT.appendChild(CANVAS)

const collectNearest = (v, stack) =>
    sortClockwise([
        v,
        ...stack
            .filter((pt) => pt !== v)
            .sort((a, b) => dist(v, a) - dist(v, b))
            .slice(0, 3)
    ])

const init = () => {
    width = SIZE[0] - MARGIN * 2
    height = SIZE[1] - MARGIN * 2
    noise = createNoise2D()
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]
    ROOT.style.display = 'block'
    ROOT.style.height = `${Math.ceil((window.innerWidth / SIZE[0]) * SIZE[1])}px`
    ROOT.style.maxHeight = '-webkit-fill-available'
    ROOT.style.overflowY = 'scroll'
    ROOT.style.paddingRight = '12px'
    // random points in sketch
    const [points1, points2] = [
        ...repeatedly2d(
            (x, y) => [MARGIN + STEP * x, MARGIN + STEP * y],
            width / STEP,
            height / STEP
        )
    ].reduce(
        (pts, p) => {
            const n1 = noise(...p.map((d) => d * 0.000005 * STEP))
            if (n1 > -0.33) {
                const a1 = Math.PI * noise(...p.map((d) => SIZE[1] + d * 0.000005 * STEP))
                return [
                    [
                        ...pts[0],
                        [
                            p[0] + Math.cos(a1) * STEP * n1,
                            p[1] + Math.sin(a1) * STEP * n1
                        ]
                    ],
                    pts[1]
                ]
            }
            return [pts[0], [...pts[1], p]]
        },
        [[], []]
    )

    // points idx group
    const ptsToGroup = [...points1],
        ptsGroups = []
    for (let i = ptsToGroup.length - 1; i >= 4; i--) {
        const quadPoints = collectNearest(ptsToGroup[i], ptsToGroup)
        const nearEnough = quadPoints.reduce(
            (b, p, i, pts) =>
                b && dist(p, pts[(i + 1) % pts.length]) < STEP * 2.5,
            true
        )
        if (nearEnough) {
            ptsGroups.push(quadPoints)
        } else {
            points2.push(...quadPoints)
        }
        ptsToGroup.splice(i, 1)
    }

    const remaining = [
        ...points1.filter((p) => {
            return ptsGroups.reduce(function (used, g) {
                return used + (g.indexOf(p) === 1 ? 1 : 0);
            }, 0) !== 4
        }),
        ...points2
    ]
    const extraQuads = []
    for (let i = remaining.length - 1; i >= 4; i--) {
        const quadPoints = collectNearest(remaining[i], remaining)
        const nearEnough = quadPoints.reduce(
            (b, p, i, pts) =>
                b && dist(p, pts[(i + 1) % pts.length]) < STEP * 4,
            true
        )
        if (nearEnough) {
            extraQuads.push(quadPoints)
        }        
        remaining.splice(i, 1)
    }

    const charsHatch = ptsGroups.map((g, i) =>
        SYSTEM.float() > 0.1
            ? getGlyphVector(SENTENCES[i % SENTENCES.length], [STEP, STEP]).map(
                  (l) => warpPoints(l, quad(g), rect([STEP, STEP]), [])
              )
            : hatch(quad(g), (Math.PI * 2) / SYSTEM.minmaxInt(4), 18)
    )

    drawElems = [
        rect(SIZE, { fill: '#111' }),
        group({ stroke: '#fefefccc', weight: 4 }, [
            ...[...points1, ...points2].map((p) => ellipse(p, 8)),
            group(
                { lineCap: 'round', weight: 4 },
                charsHatch.reduce(
                    (acc, glyph) => [
                        ...acc,
                        ...glyph.map((line) => polyline(line))
                    ],
                    []
                )
            ),
            ...ptsGroups.map((g) => quad(...g)),
            ...extraQuads.map((g) => quad(...g))
        ])
    ]

    draw(CTX, group({}, drawElems))
}

init()
window.init = init

window.exportJPG = () =>
    downloadCanvas(CANVAS, `Char in quad-${FMT_yyyyMMdd_HHmmss()}`, 'jpeg', 1)

window.exportSVG = () =>
    downloadWithMime(
        `Char in quad-${FMT_yyyyMMdd_HHmmss()}.svg`,
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

window.onkeydown = (e) => {
    switch (e.key.toLowerCase()) {
        case 'd':
            window.exportJPG()
            break
        case 'p':
            window.exportSVG()
            break
        case 'r':
            window.init()
            break
        default:
            console.log(
                `No action assigned to key [${e.key}]. Press key: \n` +
                    `- [d] to download a JPG \n` +
                    `- [p] for an SVG \n` +
                    `- [r] to generate another variation`
            )
    }
}

window.infobox = infobox
handleAction()
