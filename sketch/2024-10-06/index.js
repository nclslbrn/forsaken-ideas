import '../framed-canvas.css'
import '../framed-two-columns.css'
import './assets/style.css'
import {
    getRandSeed,
    saveSeed,
    getSavedSeed,
    cleanSavedSeed
} from '../../sketch-common/random-seed'
import { $compile } from '@thi.ng/rdom'
import { ul, li, para, div} from '@thi.ng/hiccup-html'
import Notification from '../../sketch-common/Notification'
import { rect, group, svgDoc, polyline, asSvg } from '@thi.ng/geom'
import { clipPolylinePoly } from '@thi.ng/geom-clip-line'
import { pickRandomUnique, pickRandomKey, Smush32 } from '@thi.ng/random'
import alea from 'alea'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
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
    ATTRACT_ENGINE = strangeAttractor(),
    ITER_LIST = document.createElement('div')

let seed, rnd, width, height, drawElems, attractor, prtcls, trails, noise

const iterMenu = () => {
    ITER_LIST.innerHTML = ''
    const saved = getSavedSeed()
    $compile(
        div(
            {},
            para(null, 'Saved iteration'),
            ul(
                null,
                saved.length ? 'Click on hash to render edition' : '',
                ...saved.map((iter, i) =>
                    li(
                        `.seeds`,
                        { onclick: () => init(iter[1]) },
                        null,
                        iter[1]
                    )
                )
            ),
            para(null, `Press key:`),
            ul(
                null,
                ...[
                    `[r] to render a new random edition`,
                    `[s] to save the current seed`,
                    `[c] to clean stored seeds`
                ].map((txt) => li(null, null, null, txt))
            )
        )
    ).mount(ITER_LIST)
    //  }
    // { listStyleType: 'none' }
}

const init = (newSeed) => {
    seed = newSeed
    console.log(seed)
    width = SIZE[0] - MARGIN * 2
    height = SIZE[1] - MARGIN * 2
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]
    rnd = new Smush32(seed)
    noise = createNoise2D(alea(seed))
    // create generative things here
    attractor = pickRandomKey(ATTRACT_ENGINE.attractors, rnd.flaot)
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

    const colors = pickRandomUnique(
        3,
        [
            'tomato',
            'steelblue',
            'limegreen',
            'indigo',
            'gold',
            'white',
            'black'
        ],
        [],
        1000,
        rnd
    )

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

window.init = () => init(getRandSeed())

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

window.onkeydown = (e) => {
    switch (e.key.toLowerCase()) {
        case 'r':
            init(getRandSeed())
            break
        // save the seed
        case 's':
            saveSeed(seed)
            iterMenu()
            break
        // open the hash menu
        case 'g':
            iterMenu()
            break

        case 'c':
            cleanSavedSeed()
            iterMenu()
            break

        default:
            new Notification(
                `No action assigned to key [${e.key}]. Press key: <br>` +
                    `- [s] to save the current seed <br>` +
                    `- [c] to clean stored seeds <br>`,
                ROOT
            )
    }
}



window.infobox = infobox
init(getRandSeed())
iterMenu()

ROOT.removeChild(document.getElementById('loading'))
ROOT.appendChild(CANVAS)
ROOT.appendChild(ITER_LIST)

handleAction()
