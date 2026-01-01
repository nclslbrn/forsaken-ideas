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
//  2160x3840
const DPI = quantity(96, dpi),
    // TWOK_16_9 = quantity([1080, 607], mm),
    // TWOK_9_16 = quantity([607, 1080], mm),
    // IG_SQ = quantity([700, 700], mm),
    // EXHIBIT = quantity([216 * 2.65, 384 * 2.65], mm),
    IG_4BY5 = quantity([600, 755], mm),
    SIZE = mul(IG_4BY5, DPI).deref(),
    MARGIN = convert(mul(quantity(20, mm), DPI), NONE),
    ROOT = document.getElementById('windowFrame'),
    CANVAS_2D = document.createElement('canvas'),
    CTX_2D = CANVAS_2D.getContext('2d'),
    CANVAS_GL = document.createElement('canvas'),
    GL = CANVAS_GL.getContext('webgl', { preserveDrawingBuffer: true }),
    ATTRACT_ENGINE = strangeAttractor(),
    ITER_LIST = document.createElement('div'),
    { floor, sqrt, atan2, cos, sin, abs } = Math

let STATE,
    seed = false,
    drawElems = [],
    currFrame = 0,
    frameReq = null,
    isRecording = false,
    isAnimated = false,
    recorder = null,
    uniforms = {},
    pixels = null

const init = () => {
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
        GL,
        seed
    })
    CANVAS_2D.width = SIZE[0]
    CANVAS_2D.height = SIZE[1]
    CANVAS_GL.width = SIZE[0]
    CANVAS_GL.height = SIZE[1]
    GL.viewport(0, 0, CANVAS_GL.width, CANVAS_GL.height)

    renderGLTexture()

    if (isAnimated) {
        currFrame = 0
        update()
    } else {
        draw(CTX_2D, traceLoadScreen(STATE))
        for (let i = 0; i < STATE.numIter; i++) {
            iterate()
        }
        draw(CTX_2D, group({}, trace(STATE, 'pixel')))
    }
}
const renderGLTexture = () => {
    const { width, height, shapeCount, shapes } = STATE
    const vertexShader = createShader(GL, GL.VERTEX_SHADER, vertSrc),
        fragmentShader = createShader(GL, GL.FRAGMENT_SHADER, fragSrc),
        program = createProgram(GL, vertexShader, fragmentShader)

    GL.useProgram(program)
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])

    const buffer = GL.createBuffer()
    GL.bindBuffer(GL.ARRAY_BUFFER, buffer)
    GL.bufferData(GL.ARRAY_BUFFER, vertices, GL.STATIC_DRAW)

    const positionLocation = GL.getAttribLocation(program, 'position')
    GL.enableVertexAttribArray(positionLocation)
    GL.vertexAttribPointer(positionLocation, 2, GL.FLOAT, false, 0, 0)

    uniforms = {
        resolution: GL.getUniformLocation(program, 'u_resolution'),
        shapeCount: GL.getUniformLocation(program, 'u_shapeCount'),
        shapeType: GL.getUniformLocation(program, 'u_shapeType'),
        shapePos: GL.getUniformLocation(program, 'u_shapePos'),
        shapeSize: GL.getUniformLocation(program, 'u_shapeSize'),
        shapeRot: GL.getUniformLocation(program, 'u_shapeRot')
    }

    GL.viewport(0, 0, width, height)
    GL.clearColor(0, 0, 0, 1)
    GL.clear(GL.COLOR_BUFFER_BIT)

    GL.useProgram(program)
    GL.uniform2f(uniforms.resolution, width, height)
    GL.uniform1i(uniforms.shapeCount, shapeCount)
    GL.uniform1iv(uniforms.shapeType, [...shapes.map((s) => s.type).flat()])
    GL.uniform3fv(uniforms.shapePos, [...shapes.map((s) => s.pos).flat()])
    GL.uniform3fv(uniforms.shapeSize, [...shapes.map((s) => s.size).flat()])
    GL.uniform3fv(uniforms.shapeRot, [...shapes.map((s) => s.rot).flat()])
    GL.drawArrays(GL.TRIANGLE_STRIP, 0, 4)

    const sample = document.createElement('canvas'),
        ctx = sample.getContext('2d', { willReadFrequently: true })
    sample.width = SIZE[0]
    sample.height = SIZE[1]
    ctx.drawImage(CANVAS_GL, 0, 0)
    pixels = ctx.getImageData(0, 0, sample.width, sample.height).data
}

const normalize = (v) => {
    const len = sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
    return [v[0] / len, v[1] / len, v[2] / len]
}

const glRGB = ([x, y]) => {
    if (x < 0 || x >= CANVAS_GL.width || y < 0 || y >= CANVAS_GL.height)
        return [0, 0, 0]
    const pixIdx = (floor(x) + floor(y) * CANVAS_GL.width) * 4
    const rgb = [pixels[pixIdx], pixels[pixIdx + 1], pixels[pixIdx + 2]]

    return normalize(rgb.map((x) => x * 2 - 1))
}

const iterate = () => {
    const {
        prtcls,
        trails,
        attractor,
        operator,
        noise,
        domainToPixels,
        domain
    } = STATE
    for (let j = 0; j < prtcls.length; j++) {
        const pos = ATTRACT_ENGINE.attractors[attractor]({
                x: prtcls[j][0],
                y: prtcls[j][1]
            }),
            k = noise.fbm(pos.x * 900, pos.y * 900),
            l = atan2(pos.y, pos.x),
            m = operate(operator, l, k, j, domain),
            [rx, ry, rz] = glRGB(domainToPixels(prtcls[j])),
            ra = atan2(ry, rx),
            sufaceThreshold = 0.08,
            notOverSolid =
                abs(rx - 0.5) < sufaceThreshold &&
                abs(ry - 0.5) < sufaceThreshold &&
                abs(rz - 0.5) < sufaceThreshold,
            rs = notOverSolid ? k * 0.0003 : rz * 0.01,
            mra = notOverSolid ? m : ra,
            n = [prtcls[j][0] + cos(mra) * rs, prtcls[j][1] + sin(mra) * rs]
        trails[j].push(n)
        prtcls[j] = n
    }
}

const update = () => {
    if (currFrame < STATE.numIter) {
        frameReq = requestAnimationFrame(update)
        iterate()
        drawElems = trace(STATE, 'pixel')
        draw(CTX_2D, group({}, drawElems))
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
ROOT.appendChild(CANVAS_2D)
ROOT.appendChild(CANVAS_GL)
ROOT.appendChild(ITER_LIST)

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
