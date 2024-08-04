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
import { repeatedly, repeatedly2d } from '@thi.ng/transducers'
import { dist } from '@thi.ng/vectors'
import {
    convert,
    mul,
    quantity,
    NONE,
    mm,
    dpi,
} from '@thi.ng/units'
import { getGlyphVector } from '@nclslbrn/plot-writer'
import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import sortClockwise from './sortClockwise'
import hatch from './hatch'
// default settings in inkscape DPI = 96
const DPI = quantity(200, dpi),
    SIZE = mul(quantity([297, 420], mm), DPI).deref(),
    MARGIN = convert(mul(quantity(25, mm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    STEP = 150,
    SENTENCES = 'AreYouOK?'

let width, height, drawElems

ROOT.appendChild(CANVAS)

const init = () => {
    width = SIZE[0] - MARGIN * 2
    height = SIZE[1] - MARGIN * 2
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]
    ROOT.style.display = 'block'
    ROOT.style.height = `${Math.ceil((window.innerWidth / SIZE[0]) * SIZE[1])}px`
    ROOT.style.maxHeight = '-webkit-fill-available'
    ROOT.style.overflowY = 'scroll'
    ROOT.style.paddingRight = '12px'
    // random points in sketch
    const pts = [
        ...repeatedly(
            (i) => [
                SIZE[0] / 2 + SYSTEM.norm(0.5) * (i / 25) * width * 0.5,
                SIZE[1] / 2 + SYSTEM.norm(0.5) * (i / 25) * height * 0.5
            ],
            50
        ),
        ...repeatedly2d(
            (x, y) => [
                MARGIN + STEP * SYSTEM.minmax(0.5, 0.75) + STEP * x,
                MARGIN + STEP * SYSTEM.minmax(0.5, 0.75) + STEP * y
            ],
            width / STEP,
            height / STEP
        )
    ]
    // points idx group
    const ptsToGroup = [...pts],
        ptsGroups = []
    for (let i = ptsToGroup.length - 1; i >= 4; i--) {
        const nearest = ptsToGroup
            .filter((pt) => pt !== ptsToGroup[i])
            .sort((a, b) => dist(ptsToGroup[i], a) - dist(ptsToGroup[i], b))
        const thirdNear = nearest.slice(0, 3)
        ptsGroups.push(sortClockwise([ptsToGroup[i], ...thirdNear]))
        ptsToGroup.splice(i, 1)
    }

    const charsHatch = ptsGroups.map((g, i) =>
        SYSTEM.float() > 0.15
            ? getGlyphVector(SENTENCES[i % SENTENCES.length], [STEP, STEP]).map(
                  (l) => warpPoints(l, quad(g), rect([STEP, STEP]), [])
              )
            : hatch(quad(g), (Math.PI * 2) / SYSTEM.minmaxInt(4), 16)
    )

    drawElems = [
        rect(SIZE, { fill: '#ffeeec' }),
        group({ stroke: '#333', weight: 2 }, [
            ...pts.map((p) => ellipse(p, 6)),
            ...ptsGroups.map((g) => quad(...g)),
            group(
                { weight: 6, stroke: '#333cc' },
                charsHatch.reduce(
                    (acc, glyph) => [
                        ...acc,
                        ...glyph.map((line) => polyline(line))
                    ],
                    []
                )
            )
        ])
    ]

    draw(CTX, group({}, drawElems))
}

init()
window.init = init

window['exportJPG'] = () => {
    downloadCanvas(CANVAS, `Char in quad-${FMT_yyyyMMdd_HHmmss()}`, 'jpeg', 1)
}
window['exportSVG'] = () => {
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
}

window.infobox = infobox
handleAction()
