//import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import vertSrc from './glsl/collision-detection.vert'
import fragSrc from './glsl/collision-detection.frag'
import { canvasRecorder } from '@thi.ng/dl-asset'

let isRecording = false,
    recorder = false,
    mousePos = [0, 0]

const capture = (canvas) => {
    const link = document.createElement('a')
    link.download = `op-art.jpg`
    link.href = canvas.toDataURL('image/jpg')
    link.click()
}

const startRecording = (canvas) => {
    if (isRecording) return
    recorder = canvasRecorder(canvas, 'op-art', {
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
    if (!gl) {
        console.error('WebGL not supported')
        return
    }
  
    canvas.width = 1920
    canvas.height = 1920
    gl.viewport(0, 0, canvas.width, canvas.height)
    // Create shaders and program
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertSrc),
        fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragSrc),
        program = createProgram(gl, vertexShader, fragmentShader)

    gl.useProgram(program)

    const verts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        positionLoc = gl.getAttribLocation(program, 'a_position'),
        uTimeLoc = gl.getUniformLocation(program, 'u_time'),
        uResolution = gl.getUniformLocation(program, 'u_resolution'),
        uMouse = gl.getUniformLocation(program, 'u_mouse'),
        uNoiseSeed = gl.getUniformLocation(program, 'u_noiseSeed'),
        positionBuffer = gl.createBuffer(),
        noiseSeed = Math.random() * 999
    
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)


    gl.disable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    let frame = 0

    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.uniform1f(uTimeLoc, frame * 0.01)
        gl.uniform2f(uResolution, canvas.width, canvas.height)
        gl.uniform2f(uMouse, ...mousePos)
        gl.uniform1f(uNoiseSeed, noiseSeed)
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
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true }),
    updateMousePos = (e) => {
      mousePos = [e.pageX, e.pageY]
    }

containerElement.removeChild(loader)
containerElement.appendChild(canvas)
// canvas.addEventListener('mousemove', updateMousePos, false)
init()
// document.getElementById('iconav').style.display = 'none'
window.infobox = infobox
window.init = init
window.capture = () => capture(canvas)

window.onkeydown = (e) => {
    if (e.key.toLowerCase() === 'r') startRecording(canvas)
    if (e.key.toLowerCase() === 's') stopRecording()
    if (e.key.toLowerCase() === 'g') init()
}

handleAction()
