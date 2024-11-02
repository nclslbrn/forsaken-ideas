import '../framed-canvas.css'
import '../framed-two-columns.css'
import {
    getRandSeed,
    saveSeed,
    getSavedSeed,
    removeSeed,
    cleanSavedSeed
} from '../../sketch-common/random-seed'
import { $compile } from '@thi.ng/rdom'
import { ul, li, para, div, button } from '@thi.ng/hiccup-html'
import Notification from '../../sketch-common/Notification'
import { rect, group, svgDoc, polyline, asSvg } from '@thi.ng/geom'
import { clipPolylinePoly } from '@thi.ng/geom-clip-line'
import { pickRandomUnique, pickRandom, Smush32 } from '@thi.ng/random'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { frequencies, repeatedly, repeatedly2d } from '@thi.ng/transducers'
import { convert, mul, quantity, NONE, mm, dpi, DIN_A3 } from '@thi.ng/units'
import strangeAttractor from '../../sketch-common/strange-attractors'
import Fbm from './FBM'

const DPI = quantity(96, dpi),
    SIZE = mul(quantity([1080, 607], mm), DPI).deref(),
    MARGIN = convert(mul(quantity(15, mm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    ATTRACT_ENGINE = strangeAttractor(),
    ITER_LIST = document.createElement('div'),
    RND = new Smush32()

let seed = false,
    drawElems = []

const iterMenu = () => {
    ITER_LIST.innerHTML = ''
    const saved = getSavedSeed()
    $compile(
        div(
            {},
            para(null, 'SEEDS'),
            ul(
                { style: 'list-style: none;' },
                ...saved.map((iter) =>
                    li(
                        {
                            style: 'display: flex; align-items: flex-end; width: 100%; margin-top: 0.25em'
                        },
                        button(
                            {
                                onclick: () => {
                                    seed = iter[1]
                                    init()
                                    iterMenu()
                                },
                                style: `
                                padding: 0.25em 0.5em;
                                border: 1px solid #666;
                                border-radius: 0.5em;
                                border-right: none; 
                                border-top-right-radius: 0;
                                border-bottom-right-radius: 0;
                                background: ${iter[1] === seed ? '#ffd128' : '#ccc'}; 
                              `
                            },
                            iter[1]
                        ),
                        button(
                            {
                                onclick: () => {
                                    removeSeed(iter[1])
                                    iterMenu()
                                },
                                style: `
                                padding: 0.25em 0.5em;
                                border: 1px solid #666; 
                                border-radius: 0.5em;
                                border-top-left-radius: 0;
                                border-bottom-left-radius: 0;
                            `
                            },
                            '×'
                        )
                    )
                )
            ),
            para(null, `PRESS`),
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
}

const init = () => {
    if (!seed) return
    console.log(seed)
    RND.seed(seed)
    const noise = new Fbm({
      amplitude: 0.07,
      octave: 4,
      frequencies: 0.7,
      prng: () => RND.float 
    })
    const width = SIZE[0] - MARGIN * 2
    const height = SIZE[1] - MARGIN * 2
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]
    const attractor = pickRandom(Object.keys(ATTRACT_ENGINE.attractors), RND)
    ATTRACT_ENGINE.init(attractor, () => RND.float())

    const prtcls = [
        ...repeatedly2d((x, y) => [(x/25)-0.5, (y/25)-0.5], 50, 50)
    ]
    const trails = [...repeatedly((i) => [prtcls[i]], prtcls.length)]

    for (let i = 0; i < 400; i++) {
        for (let j = 0; j < prtcls.length; j++) {
            const pos = ATTRACT_ENGINE.attractors[attractor]({
                x: prtcls[j][0],
                y: prtcls[j][1]
            })
            const k = Math.abs(noise.fbm(pos.x * 300, pos.y * 300))
            const l = Math.atan2(pos.y, pos.x)
            const m = [
                prtcls[j][0] + Math.cos(l) * k * 0.03,
                prtcls[j][1] + Math.sin(l) * k * 0.03
            ]
            trails[j].push(m)
            prtcls[j] = m
        }
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
        RND
    )

    const cropPoly = [
        [MARGIN, MARGIN],
        [width - MARGIN, MARGIN],
        [width - MARGIN, height - MARGIN],
        [MARGIN, height - MARGIN]
    ]
    drawElems = [
        rect(SIZE, { fill: colors[0] }),
        group({ weight: 2 }, [
            ...trails.reduce(
                (acc, line, i) => [
                    ...acc,
                    ...clipPolylinePoly(
                        line.map((pos) => [
                            width/2 + pos[0] * (width / 2),
                            height/2 + pos[1] * (height / 2)
                        ]),
                        cropPoly
                    ).map((pts) =>
                        polyline(pts, { stroke: colors[1 + (i % 10 === 0 ? 1 : 0)] })
                    )
                ],
                []
            )
        ])
    ]

    draw(CTX, group({}, drawElems))
}

window['init'] = () => {
    seed = getRandSeed()
    init()
}
window['exportJPG'] = () =>
    downloadCanvas(CANVAS, `2024 10 60-${seed}`, 'jpeg', 1)
window['exportSVG'] = () =>
    downloadWithMime(
        `2024 10 60-${seed}.svg`,
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
            seed = getRandSeed()
            init()
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
            iterMenu(seed)
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
seed = getRandSeed()
console.log(seed)
init()
iterMenu(seed)

ROOT.removeChild(document.getElementById('loading'))
ROOT.appendChild(CANVAS)
ROOT.appendChild(ITER_LIST)

handleAction()
