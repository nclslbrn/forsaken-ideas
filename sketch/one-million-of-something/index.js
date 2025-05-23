import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import vertSrc from './glsl/base.vert'
import fragSrc from './glsl/base.frag'
import CONSTANTS from './CONSTANTS'
import { createShader, createProgram } from '../../sketch-common/shaderUtils'

const capture = (canvas) => {
    const link = document.createElement('a')
    link.download = `one-million-ofsomething.jpg`
    link.href = canvas.toDataURL('image/jpg')
    link.click()
}

const init = () => {
    if (!gl) {
        console.error('WebGL not supported')
        return
    }
 
    canvas.width = 1280
    canvas.height = 1280
    gl.viewport(0, 0, canvas.width, canvas.height)
    // Create shaders and program
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertSrc)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragSrc)
    const program = createProgram(gl, vertexShader, fragmentShader)
    const constant = CONSTANTS[Math.floor(Math.random()*CONSTANTS.length)]

    const NUM_PARTICLES = 1000000
    const particleData = new Float32Array(NUM_PARTICLES * 5) // [x, y, vx, vy, life]
    for (let i = 0; i < NUM_PARTICLES; i++) {
        const index = i * 5
        particleData[index] = Math.random() - 0.5 // x
        particleData[index + 1] = Math.random() - 0.5 // y
        particleData[index + 2] = Math.random() * 0.2 - 0.1 // vx
        particleData[index + 3] = Math.random() * 0.2 - 0.1 // vy
        particleData[index + 4] = Math.random() * 3 + 1 // life
    }

    const particleBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, particleData, gl.STATIC_DRAW)

    const aPositionLoc = gl.getAttribLocation(program, 'a_position')
    const aVelocityLoc = gl.getAttribLocation(program, 'a_velocity')
    const aLifeLoc = gl.getAttribLocation(program, 'a_life')
    const uTimeLoc = gl.getUniformLocation(program, 'u_time')
    const uResolution = gl.getUniformLocation(program, 'u_resolution')
    const uConstants = gl.getUniformLocation(program, 'u_constant')
    
    gl.useProgram(program)

    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 20, 0)
    gl.enableVertexAttribArray(aPositionLoc)
    gl.vertexAttribPointer(aVelocityLoc, 2, gl.FLOAT, false, 20, 8)
    gl.enableVertexAttribArray(aVelocityLoc)
    gl.vertexAttribPointer(aLifeLoc, 1, gl.FLOAT, false, 20, 16)
    gl.enableVertexAttribArray(aLifeLoc)

    let frame = 0

    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.uniform1f(uTimeLoc, frame * 0.005)
        gl.uniform2f(uResolution, 1, 1)
        gl.uniform4f(uConstants, ...constant)
        gl.drawArrays(gl.POINTS, 0, NUM_PARTICLES)
        frame++;
        requestAnimationFrame(render)
    }
    gl.clearColor(0, 0, 0, 1)
    render()
}

const containerElement = document.getElementById('windowFrame'),
    loader = document.getElementById('loading'),
    canvas = document.createElement('canvas'),
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true })


containerElement.removeChild(loader)
containerElement.appendChild(canvas)
init()
//document.getElementById('iconav').style.display = 'none'
window.infobox = infobox
window.init = init
window.capture = () => capture(canvas)
handleAction()
