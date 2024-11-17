import '../framed-canvas.css'
import '../framed-two-columns.css'
import {
    getRandSeed,
    saveSeed,
    cleanSavedSeed
} from '../../sketch-common/random-seed'

import { resolveState } from './state'
import Notification from '../../sketch-common/Notification'
import strangeAttractor from '../../sketch-common/strange-attractors'
import { group, svgDoc, asSvg } from '@thi.ng/geom'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import {
    downloadCanvas,
    downloadWithMime,
    canvasRecorder
} from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { convert, mul, quantity, NONE, mm, dpi, DIN_A3 } from '@thi.ng/units'

import { iterMenu } from './iter-menu'
import { operate } from './operator'
import { trace, traceLoadScreen } from './trace'

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
    NUM_ITER = 60

ROOT.style.gridTemplateRows = '1fr 98% 1fr'
CANVAS.style.padding = '0'

let STATE,
    drawElems = [],
    currFrame = 0,
    frameReq = null,
    isRecording = false,
    recorder = null

window.seed = false

const init = () => {
    if (!window.seed) return
    if (frameReq) cancelAnimationFrame(frameReq)
    if (isRecording) startRecording()
    STATE = resolveState(
        {
            width: SIZE[0],
            height: SIZE[1],
            margin: MARGIN
        },
        window.seed
    )
    CANVAS.width = SIZE[0]
    CANVAS.height = SIZE[1]
    /* plot with animation 
    currFrame = 0
    update()
    */
    /* plot wihout */ 
    draw(CTX, traceLoadScreen(STATE))
    for (let i = 0; i < NUM_ITER; i++) {
        iterate()
    }
    drawElems = trace(STATE)
    draw(CTX, group({}, drawElems))
    
}

const iterate = () => {
    const { prtcls, trails, attractor, operator, noise } = STATE
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
}

const update = () => {
    if (currFrame < NUM_ITER) {
        frameReq = requestAnimationFrame(update)
        iterate()
        drawElems = trace(STATE)
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
