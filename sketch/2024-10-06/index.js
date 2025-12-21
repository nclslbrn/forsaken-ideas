// import '../framed-canvas.css'
// import '../framed-two-columns.css'
import './style.css'
import {
    getRandSeed,
    saveSeed,
    cleanSavedSeed
} from '../../sketch-common/random-seed'
import vertSrc from './glsl/base.vert'
import fragSrc from './glsl/base.frag'

import { createShader, createProgram } from '../../sketch-common/shaderUtils'
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
import { MATH } from '@thi.ng/vectors'

const DPI = quantity(96, dpi),
    // TWOK_16_9 = quantity([1080, 607], mm),
    TWOK_9_16 = quantity([607, 1080], mm),
    // IG_SQ = quantity([700, 700], mm),
    // IG_4BY5 = quantity([600, 755], mm),
    SIZE = mul(TWOK_9_16, DPI).deref(),
    MARGIN = convert(mul(quantity(40, mm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS_2D = document.createElement('canvas'),
    CTX_2D = CANVAS_2D.getContext('2d'),
    CANVAS_GL = document.createElement('canvas'),
    GL = CANVAS_GL.getContext('webgl', { preserveDrawingBuffer: true }),
    ATTRACT_ENGINE = strangeAttractor(),
    ITER_LIST = document.createElement('div'),
    NUM_ITER = 70

let STATE,
    seed = false,
    drawElems = [],
    currFrame = 0,
    frameReq = null,
    isRecording = false,
    isAnimated = false,
    recorder = null,
    uniform = {}

const init = async () => {
    if (!seed) return
    if (frameReq) cancelAnimationFrame(frameReq)
    if (isRecording) startRecording()
    if (!GL) {
        console.error('WebGL not supported')
        return
    }

    STATE = resolveState({
        width: SIZE[0],
        height: SIZE[1],
        margin: MARGIN,
        CANVAS_GL,
        seed
    })
    CANVAS_2D.width = SIZE[0]
    CANVAS_2D.height = SIZE[1]
    CANVAS_GL.width = SIZE[0]
    CANVAS_GL.height = SIZE[1]
    GL.viewport(0, 0, CANVAS_GL.width, CANVAS_GL.height)

    const vertexShader = createShader(GL, GL.VERTEX_SHADER, vertSrc),
        fragmentShader = createShader(GL, GL.FRAGMENT_SHADER, fragSrc),
        program = createProgram(GL, vertexShader, fragmentShader)

    GL.useProgram(program)

    const buffer = GL.createBuffer(),
        verts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        positionLoc = GL.getAttribLocation(program, 'a_position')

    uniform.uTimeLoc = GL.getUniformLocation(program, 'u_time')
    uniform.uResolution = GL.getUniformLocation(program, 'u_resolution')
    uniform.uNoiseSeed = GL.getUniformLocation(program, 'u_noiseSeed')
    uniform.uNoiseSize = GL.getUniformLocation(program, 'u_noiseSize')
    uniform.uNumCell = GL.getUniformLocation(program, 'u_numCell')
    uniform.uCells = GL.getUniformLocation(program, 'u_cells')

    GL.bindBuffer(GL.ARRAY_BUFFER, buffer)
    GL.bufferData(GL.ARRAY_BUFFER, verts, GL.STATIC_DRAW)
    GL.enableVertexAttribArray(positionLoc)
    GL.vertexAttribPointer(positionLoc, 2, GL.FLOAT, false, 0, 0)
    GL.disable(GL.DEPTH_TEST)
    GL.enable(GL.BLEND)
    GL.clearColor(1, 1, 1, 1)
    GL.clear(GL.COLOR_BUFFER_BIT)
    GL.uniform1f(uniform.uTimeLoc, 0.1)
    GL.uniform2f(uniform.uResolution, CANVAS_GL.width, CANVAS_GL.height)
    GL.uniform1f(uniform.uNoiseSeed, STATE.glUniform.noiseSeed)
    GL.uniform1f(uniform.uNoiseSize, STATE.glUniform.noiseSize)
    GL.uniform1i(uniform.uNumCell, STATE.glUniform.numCell)
    GL.uniform4fv(
        uniform.uCells,
        STATE.glUniform.cells.reduce((s, c) => [...s, ...c], [])
    )
    GL.drawArrays(GL.TRIANGLE_STRIP, 0, 4)

    if (isAnimated) {
        currFrame = 0
        update()
    } else {
        draw(CTX_2D, traceLoadScreen(STATE))
        for (let i = 0; i < NUM_ITER; i++) {
            iterate()
        }
        draw(CTX_2D, group({}, trace(STATE, 'pixel')))
    }
}

const iterate = () => {
    const { prtcls, trails, attractor, operator, noise, glGrayscale } = STATE
    for (let j = 0; j < prtcls.length; j++) {
        const pos = ATTRACT_ENGINE.attractors[attractor]({
                x: prtcls[j][0],
                y: prtcls[j][1]
            }),
            k = noise.fbm(pos.x * 900, pos.y * 900),
            l = Math.atan2(pos.y, pos.x),
            m = operate(operator, l, k, j),
            g = glGrayscale(pos.x, pos.y),
            r = g > 275 ? (g / 255) * Math.PI * 2 : m,
            n = [
                prtcls[j][0] + Math.cos(r) * 0.002 * k,
                prtcls[j][1] + Math.sin(r) * 0.002 * k
            ]
        trails[j].push(n)
        prtcls[j] = n
    }
}

const update = () => {
    console.log(STATE)
    if (currFrame < NUM_ITER) {
        frameReq = requestAnimationFrame(update)
        iterate()
        drawElems = trace(STATE, 'pixel')
        draw(CTX, group({}, drawElems))
        currFrame++
    } else {
        if (isRecording) stopRecording()
        new Notification('Edition drawn', ROOT, 'light')
    }
}

window['init'] = () => {
    seed = getRandSeed()
    init()
}
window['exportJPG'] = () =>
    downloadCanvas(CANVAS_2D, `2024 10 60-${seed}`, 'jpeg', 1)

window['exportSVG'] = () =>
    downloadWithMime(
        `2024-10-06-${seed}.svg`,
        asSvg(
            svgDoc(
                {
                    width: SIZE[0],
                    height: SIZE[1],
                    viewBox: `0 0 ${SIZE[0]} ${SIZE[1]}`
                },
                group({}, trace(STATE, 'vector'))
            )
        )
    )

window.onkeydown = (e) => {
    switch (e.key.toLowerCase()) {
        case 'n':
            seed = getRandSeed()
            init()
            break
        // save the seed
        case 's':
            saveSeed(seed)
            iterMenu(ITER_LIST, STATE)
            break

        case 'c':
            cleanSavedSeed()
            iterMenu(ITER_LIST, STATE)
            break

        case 'r':
            if (isRecording) stopRecording()
            isRecording = !isRecording
            isAnimated = !isAnimated
            init()
            break
    }
}

const startRecording = () => {
    if (!isRecording) return
    recorder = canvasRecorder(
        CANVAS_2D,
        `${seed}-${new Date().toISOString()}.mp4`,
        {
            mimeType: 'video/mp4',
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
ROOT.appendChild(CANVAS_GL)
ROOT.appendChild(CANVAS_2D)
ROOT.appendChild(ITER_LIST)

CANVAS_GL.width /= 10
CANVAS_GL.height /= 10

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
if (urlParams.has('seed')) {
    seed = urlParams.get('seed')
} else {
    seed = getRandSeed()
}
init()

console.log(
    `seed : ${STATE.seed}
theme: ${STATE.theme}
attractor: ${STATE.attractor}
operate: ${STATE.operator}`
)
iterMenu(ITER_LIST, STATE)
handleAction()
