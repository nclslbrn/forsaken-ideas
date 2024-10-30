import { rect, group, svgDoc, polyline, asSvg } from '@thi.ng/geom'
import { clipPolylinePoly } from '@thi.ng/geom-clip-line'
import { pickRandomUnique, pickRandomKey } from '@thi.ng/random'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { repeatedly, repeatedly2d } from '@thi.ng/transducers'
import { convert, mul, quantity, NONE, mm, dpi, DIN_A3 } from '@thi.ng/units'
import strangeAttractor from '../../sketch-common/strange-attractors'
import { createNoise2D } from 'simplex-noise'

const DPI = quantity(96, dpi), // default settings in inkscape
    SIZE = mul(DIN_A3, DPI).deref(),
    MARGIN = convert(mul(quantity(15, mm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    ATTRACT_ENGINE = strangeAttractor()

let width, height, drawElems, attractor, prtcls, trails, noise

ROOT.appendChild(CANVAS)
const randColor = (num) =>
    pickRandomUnique(num, [
        'tomato',
        'steelblue',
        'limegreen',
        'indigo',
        'gold',
        'white',
        'black'
    ])

const init = () => {
    width = SIZE[0] - MARGIN * 2
    height = SIZE[1] - MARGIN * 2
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]
    noise = createNoise2D()
    // create generative things here
    attractor = pickRandomKey(ATTRACT_ENGINE.attractors)
    ATTRACT_ENGINE.init(attractor)

    prtcls = [...repeatedly2d((x, y) => [(x - 15) / 30, (y - 15) / 30], 30, 30)]
    trails = [...repeatedly((i) => [prtcls[i]], prtcls.length)]

    for (let i = 0; i < 100; i++) {
        for (let j = 0; j < prtcls.length; j++) {
            const pos = ATTRACT_ENGINE.attractors[attractor]({
                x: prtcls[j][0],
                y: prtcls[j][1]
            })
            const k = noise(pos.x * 4, pos.y * 4)
            const l = Math.sin(Math.atan2(pos.y, pos.x))
            const m = [
                prtcls[j][0] + Math.cos(l) * k * 0.3,
                prtcls[j][1] + Math.sin(l) * k * 0.3
            ]
            trails[j].push(m)
            prtcls[j] = m
        }
        // ATTRACT_ENGINE.init(attractor)
    }

    const colors = randColor(3)
    const cropPoly = [
        [MARGIN, MARGIN],
        [width - MARGIN, MARGIN],
        [width - MARGIN, height - MARGIN],
        [MARGIN, height - MARGIN]
    ]
    drawElems = [
        rect(SIZE, { fill: colors[0] }),
        group({ weight: 0.5 }, [
            ...trails.reduce(
                (acc, line, i) => [
                    ...acc,
                    ...clipPolylinePoly(
                        line.map((pos) => [
                            pos[0] * (width / 2) + width / 2,
                            pos[1] * (height / 2) + height / 2
                        ]),
                        cropPoly
                    ).map((pts) =>
                        polyline(pts, { stroke: colors[1 + (i % 2)] })
                    )
                ],
                []
            )
        ])
    ]

    draw(CTX, group({}, drawElems))
}

window.init = init

window.exportJPG = () =>
    downloadCanvas(CANVAS, `2024 10 60-${FMT_yyyyMMdd_HHmmss()}`, 'jpeg', 1)

window.exportSVG = () =>
    downloadWithMime(
        `2024 10 60-${FMT_yyyyMMdd_HHmmss()}.svg`,
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

window.infobox = infobox
init()
handleAction()
