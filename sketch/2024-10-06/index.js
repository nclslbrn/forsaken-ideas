import '../framed-canvas.css'
import '../framed-two-columns.css'
import {
    getRandSeed,
    saveSeed,
    cleanSavedSeed
} from '../../sketch-common/random-seed'

import Notification from '../../sketch-common/Notification'
import { rect, group, svgDoc, polyline, asSvg } from '@thi.ng/geom'
import { clipPolylinePoly } from '@thi.ng/geom-clip-line'
import { pickRandom, pickRandomKey, Smush32 } from '@thi.ng/random'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { getGlyphVector } from '@nclslbrn/plot-writer'
import {
    downloadCanvas,
    downloadWithMime,
    canvasRecorder
} from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { repeatedly2d } from '@thi.ng/transducers'
import { convert, mul, quantity, NONE, mm, dpi, DIN_A3 } from '@thi.ng/units'
import { iterMenu } from './iter-menu'
import strangeAttractor from '../../sketch-common/strange-attractors'
import Fbm from './FBM'

const DPI = quantity(96, dpi),
    TWOK_16_9 = quantity([1080, 607], mm),
    // TWOK_9_16 = quantity([607, 1080], mm),
    IG_SQ = quantity([700, 700], mm),
    IG_4BY5 = quantity([600, 755], mm),
    SIZE = mul(IG_4BY5, DPI).deref(),
    MARGIN = convert(mul(quantity(40, mm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS = document.createElement('canvas'),
    CTX = CANVAS.getContext('2d'),
    ATTRACT_ENGINE = strangeAttractor(),
    ITER_LIST = document.createElement('div'),
    RND = new Smush32(),
    BCKGRND = ['#eeede7', '#e2ded0', '#a7c0be', '#f1ebe9'],
    NUM_ITER = 60,
    OPERATORS = [
        // 'A % B',
        //'B % A',
        'A ^ B % 0.2',
        //'B ^ A % 0.2'
    ],
    STATE = {
        attractor: '',
        noise: null,
        prtcls: [],
        trails: [],
        colors: [],
        operator: 'add',
        color: '#fefefe'
    },
    operate = (type, a, b, c) => {
        switch (type) {
            case 'A % B':
                return a % b
            case 'B % A':
                return c % 2 === 0 ? b % a : (a + b) / 2
            case 'A ^ B % 0.2':
                return  a % ((c%10) + b) * 0.05  
            case 'B ^ A % 0.2':
                return (b << a) - a
        }
    }

let drawElems = [],
    currFrame = 0,
    inner = [],
    frameReq = null,
    isRecording = false,
    recorder = null

window.seed = false

const init = () => {
    if (!window.seed) return
    if (frameReq) cancelAnimationFrame(frameReq)
    if (isRecording) startRecording()

    RND.seed(window.seed)
    STATE.noise = new Fbm({
        amplitude: 0.4,
        octave: 7,
        frequencies: 0.7,
        prng: () => RND.float
    })
    STATE.attractor = pickRandom(Object.keys(ATTRACT_ENGINE.attractors), RND)
    STATE.operator = pickRandom(OPERATORS, RND)
    inner = [SIZE[0] - MARGIN * 2, SIZE[1] - MARGIN * 2]
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]
    ATTRACT_ENGINE.init(STATE.attractor, () => RND.float())

    STATE.prtcls = [
        ...repeatedly2d(
            (x, y) => [
                (RND.norm(10) + x) / 100 - 0.5,
                (RND.norm(10) + y) / 100 - 0.5
            ],
            100,
            100
        )
    ]
    STATE.trails = STATE.prtcls.map((p) => [p])
    STATE.color = pickRandom(BCKGRND)
    currFrame = 0
    update()
}

const update = () => {
    const scale = 0.95
    if (currFrame < NUM_ITER) {
        frameReq = requestAnimationFrame(update)
        const { prtcls, trails, attractor, operator, noise, color } = STATE
        for (let j = 0; j < prtcls.length; j++) {
            const pos = ATTRACT_ENGINE.attractors[attractor]({
                    x: prtcls[j][0],
                    y: prtcls[j][1]
                }),
                k = Math.abs(noise.fbm(pos.x * 900, pos.y * 900)),
                l = Math.atan2(pos.y, pos.x),
                m = operate(operator, l, k, j),
                n = [
                    prtcls[j][0] + Math.cos(m) * k * 0.003,
                    prtcls[j][1] + Math.sin(m) * k * 0.003
                ]
            trails[j].push(n)
            prtcls[j] = n
        }

        const cropPoly = [
            [MARGIN, MARGIN],
            [SIZE[0] - MARGIN, MARGIN],
            [SIZE[0] - MARGIN, SIZE[1] - MARGIN],
            [MARGIN, SIZE[1] - MARGIN]
        ]
        drawElems = [
            rect(SIZE, { fill: color }),
            group({ weight: 1.5, stroke: '#333' }, [
                ...[
                    ...window.seed,
                    ...' → ',
                    ...attractor,
                    //...' → ',
                    //...operator
                ].reduce(
                    (poly, letter, x) => [
                        ...poly,
                        ...getGlyphVector(
                            letter,
                            [SIZE[0] * 0.007, SIZE[0] * 0.01],
                            [
                                MARGIN + SIZE[0] * 0.008 * x,
                                SIZE[1] - MARGIN * 0.55
                            ]
                        ).map((vecs) => polyline(vecs))
                    ],
                    []
                ),
                ...trails.reduce(
                    (acc, line) => [
                        ...acc,
                        ...clipPolylinePoly(
                            line.map((pos) => [
                                SIZE[0] / 2 + pos[0] * inner[0] * scale,
                                SIZE[1] / 2 + pos[1] * inner[1] * scale
                            ]),
                            cropPoly
                        ).map((pts) => polyline(pts))
                    ],
                    []
                )
            ])
        ]

        draw(CTX, group({}, drawElems))
        currFrame++
    } else {
        if (isRecording) stopRecording()
        new Notification('Edition drawn', ROOT, 'light')
    }
}

window['init'] = () => {
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
        case 'n':
            window.seed = getRandSeed()
            init()
            break
        // save the seed
        case 's':
            saveSeed(window.seed)
            iterMenu(ITER_LIST, STATE)
            break

        case 'c':
            cleanSavedSeed()
            iterMenu(ITER_LIST, STATE)
            break

        case 'r':
            isRecording = !isRecording
            init()
            break

        default:
            new Notification(
                `No action assigned to key [${e.key}]. Press key: <br>` +
                    `- [n] to generate a new seed (and a new iteration)<br>` +
                    `- [s] to save the current seed <br>` +
                    `- [c] to clean stored seeds <br>` +
                    `- [r] to record a video capture`,
                ROOT,
                'light'
            )
    }
}

const startRecording = () => {
    if (!isRecording) return
    recorder = canvasRecorder(
        CANVAS,
        `${window.seed}-${new Date().toISOString()}`,
        {
            mimeType: 'video/webm;codecs=vp9',
            fps: 30
        }
    )
    recorder.start()
    console.log('%c Record started ', 'background: tomato; color: white')
}

const stopRecording = () => {
    if (!isRecording) return
    recorder.stop()
    console.log('%c Record stopped ', 'background: limegreen; color: black')
}

window.infobox = infobox

ROOT.removeChild(document.getElementById('loading'))
ROOT.appendChild(CANVAS)
ROOT.appendChild(ITER_LIST)

window.seed = getRandSeed()
init()
iterMenu(ITER_LIST, STATE)

handleAction()
