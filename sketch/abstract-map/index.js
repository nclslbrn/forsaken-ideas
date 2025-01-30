import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import vertSrc from './glsl/base.vert'
import fragSrc from './glsl/base.frag'
import { canvasRecorder } from '@thi.ng/dl-asset'

let isRecording = false,
    recorder = false,
    mouseX = 0.5,
    mouseY = 0.,
    moved = false,
    noiseSeed = 0

const capture = (canvas) => {
    const link = document.createElement('a')
    link.download = `abstract-map.jpg`
    link.href = canvas.toDataURL('image/jpg')
    link.click()
}

const startRecording = (canvas) => {
    if (isRecording) return
    recorder = canvasRecorder(canvas, 'abstract-map', {
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

const sketch = {
  frame: 0,
  noiseSeed: Math.random() * 999,
  uTimeLoc: null,
  uNoiseSeed: null,
  uResolution: null,
  uMouse: null,
  init: () => { 
    sketch.noiseSeed = Math.random() * 999
    sketch.render()
  },
  setup: () => {
    if (!gl) {
        console.error('WebGL not supported')
        return
    }
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    gl.viewport(0, 0, canvas.width, canvas.height)
    // Create shaders and program
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertSrc),
        fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragSrc),
        program = createProgram(gl, vertexShader, fragmentShader)

    gl.useProgram(program)

    const buffer = gl.createBuffer(),
        verts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        positionLoc = gl.getAttribLocation(program, 'a_position')

    sketch.uTimeLoc = gl.getUniformLocation(program, 'u_time')
    sketch.uResolution = gl.getUniformLocation(program, 'u_resolution')
    sketch.uMouse = gl.getUniformLocation(program, 'u_mouse')
    sketch.uNoiseSeed = gl.getUniformLocation(program, 'u_noiseSeed')

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)
    gl.disable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    sketch.init()
    gl.clearColor(1, 1, 1, 1)
    canvas.addEventListener('mousedown', () => { moved = true })
    canvas.addEventListener('mousemove', (event) => {
      if (moved) {
        mouseX = (event.pageX / canvas.width) - .5
        mouseY = .5 - (event.pageY / canvas.height)
        sketch.render()
      }
    })
    canvas.addEventListener('click', () => { moved = false})
  },
  render: () => {
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.uniform1f(sketch.uTimeLoc, sketch.frame * 0.01)
        gl.uniform2f(sketch.uResolution, canvas.width, canvas.height)
        gl.uniform2f(sketch.uMouse, mouseX, mouseY)
        gl.uniform1f(sketch.uNoiseSeed, sketch.noiseSeed)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

        sketch.frame++
        //requestAnimationFrame(render)
    }
  }

const containerElement = document.getElementById('windowFrame'),
    loader = document.getElementById('loading'),
    canvas = document.createElement('canvas'),
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true })

containerElement.removeChild(loader)
containerElement.appendChild(canvas)
sketch.setup()
window.infobox = infobox
window.capture = () => capture(canvas)
window.init = () => { sketch.init() }
window.onkeydown = (e) => {
    if (e.key.toLowerCase() === 'r') startRecording(canvas)
    if (e.key.toLowerCase() === 's') stopRecording()
    if (e.key.toLowerCase() === 'g') init()
}

handleAction()
