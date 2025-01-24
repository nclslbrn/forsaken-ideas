import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import vertSrc from './glsl/base.vert'
import fragSrc from './glsl/base.frag'
import { canvasRecorder } from '@thi.ng/dl-asset'
import { repeatedly } from '@thi.ng/transducers'

let isRecording = false,
    recorder = false,
    traits = {}

const capture = (canvas) => {
    const link = document.createElement('a')
    link.download = `gradients-only.jpg`
    link.href = canvas.toDataURL('image/jpg')
    link.click()
}

const startRecording = (canvas) => {
    if (isRecording) return
    recorder = canvasRecorder(canvas, 'gradients-only', {
        mimeType: 'video/webm;codecs=vp8',
        fps: 30
    })
    recorder.start()
    console.log('%c Record started ', 'background: tomato; color: white')
    isRecording = true
}

const stopRecording = () => {
    if (!isRecording) return
    recorder.stop()
    console.log('%c Record stopped ', 'background: limegreen; color: black')
    isRecording = false
}

const createShader = (gl, type, source) => {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile failed:', gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
    }
    return shader
}

const createProgram = (gl, vertexShader, fragmentShader) => {
    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link failed:', gl.getProgramInfoLog(program))
        return null
    }
    return program
}

const init = () => {
    const numStack = Math.ceil(Math.random() * 2),
        rhombus = [
            ...repeatedly((c) => {
                const rhombPerStack = Math.ceil(Math.random() * 5),
                    width = 0.1 + Math.random() * 0.15,
                    xPos = (1 / (numStack + 1)) * (c + 1),
                    startY = Math.random() * 0.5,
                    endY = 1 - Math.random() * 0.5,
                    stepY = Math.abs(endY - startY) / rhombPerStack

                return [
                    ...repeatedly(
                        (y) => [xPos, startY + stepY * y, width, stepY * 2], // x,y,w,h
                        rhombPerStack
                    )
                ]
            }, numStack)
        ],
        rhombNum = rhombus.reduce((s, stack) => s + stack.length, 0),
        rhombFlat = rhombus.reduce((f, stack) => [...f, ...stack.flat()], [])
    traits = { numStack, rhombus, rhombNum, rhombFlat }
}

const setup = () => {
    if (!gl) {
        console.error('WebGL not supported')
        return
    }

    canvas.width = 2400
    canvas.height = 2400
    gl.viewport(0, 0, canvas.width, canvas.height)
    // Create shaders and program
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertSrc),
        fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragSrc),
        program = createProgram(gl, vertexShader, fragmentShader)

    gl.useProgram(program)

    const buffer = gl.createBuffer(),
        verts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        positionLoc = gl.getAttribLocation(program, 'a_position'),
        uTimeLoc = gl.getUniformLocation(program, 'u_time'),
        uResolution = gl.getUniformLocation(program, 'u_resolution'),
        uRhombus = gl.getUniformLocation(program, 'u_rhombus'),
        uRhombNum = gl.getUniformLocation(program, 'u_rhombNum')

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)
    gl.disable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    let frame = 0

    init()

    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.uniform1f(uTimeLoc, frame * 0.001)
        gl.uniform2f(uResolution, canvas.width, canvas.height)
        gl.uniform1i(uRhombNum, traits.rhombNum)
        gl.uniform4fv(uRhombus, traits.rhombFlat)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

        frame++
        requestAnimationFrame(render)
    }
    gl.clearColor(1, 1, 1, 1)
    render()
}

const containerElement = document.getElementById('windowFrame'),
    loader = document.getElementById('loading'),
    canvas = document.createElement('canvas'),
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true })

containerElement.removeChild(loader)
containerElement.appendChild(canvas)
setup()
//document.getElementById('iconav').style.display = 'none'
window.infobox = infobox
window.init = init
window.capture = () => capture(canvas)

window.onkeydown = (e) => {
    if (e.key.toLowerCase() === 'r') startRecording(canvas)
    if (e.key.toLowerCase() === 's') stopRecording()
    if (e.key.toLowerCase() === 'g') init()
}

handleAction()
