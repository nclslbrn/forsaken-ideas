//import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import vertSrc from './glsl/base.vert'
import fragSrc from './glsl/base.frag'

const containerElement = document.getElementById('windowFrame'),
    loader = document.getElementById('loading'),
    canvas = document.createElement('canvas'),
    dpr = window.devicePixelRatio || 1,
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true })

function createShader(gl, type, source) {
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

function createProgram(gl, vertexShader, fragmentShader) {
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
function updateViewport() {
    canvas.width = 1280
    canvas.height = 1280
    //canvas.style.width = window.innerWidth + 'px'
    //canvas.style.height = window.innerHeight + 'px'
    gl.viewport(0, 0, canvas.width, canvas.height)
}

function init() {
    if (!gl) {
        console.error('WebGL not supported')
        return
    }

    // Create shaders and program
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertSrc)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragSrc)
    const program = createProgram(gl, vertexShader, fragmentShader)

    const NUM_PARTICLES = 1000000
    const particleData = new Float32Array(NUM_PARTICLES * 5) // [x, y, vx, vy, life]
    for (let i = 0; i < NUM_PARTICLES; i++) {
        const index = i * 5
        particleData[index] = Math.random() - 0.5 // x
        particleData[index + 1] = Math.random() - 0.5 // y
        particleData[index + 2] = Math.random() * 0.2 - 0.1 // vx
        particleData[index + 3] = Math.random() * 0.2 - 0.1 // vy
        particleData[index + 4] = Math.random() * 2 + 1 // life
    }

    const particleBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, particleData, gl.STATIC_DRAW)

    const aPositionLoc = gl.getAttribLocation(program, 'a_position')
    const aVelocityLoc = gl.getAttribLocation(program, 'a_velocity')
    const aLifeLoc = gl.getAttribLocation(program, 'a_life')
    const uTimeLoc = gl.getUniformLocation(program, 'u_time')
    const uResolution = gl.getUniformLocation(program, 'u_resolution')

    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 20, 0)
    gl.enableVertexAttribArray(aPositionLoc)
    gl.vertexAttribPointer(aVelocityLoc, 2, gl.FLOAT, false, 20, 8)
    gl.enableVertexAttribArray(aVelocityLoc)
    gl.vertexAttribPointer(aLifeLoc, 1, gl.FLOAT, false, 20, 16)
    gl.enableVertexAttribArray(aLifeLoc)

    gl.useProgram(program)

    let startTime = performance.now()

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT)
        const currentTime = (performance.now() - startTime) / 1000
        gl.uniform1f(uTimeLoc, currentTime)
        
        const aspectRatio = canvas.width / canvas.height
        // Pass the aspect ratio to correct the scaling
        // if (aspectRatio > 1) {
        //    gl.uniform2f(uResolution, 1/aspectRatio, 1)
        // } else {
            gl.uniform2f(uResolution, 1, 1)
        // } 
        
        gl.drawArrays(gl.POINTS, 0, NUM_PARTICLES)
        requestAnimationFrame(render)
    }
    updateViewport()
    gl.clearColor(0, 0, 0, 1)
    render()
    window.addEventListener('resize', updateViewport)
}

containerElement.removeChild(loader)
containerElement.appendChild(canvas)
//canvas.width = window.innerWidth
//canvas.height = window.innerHeight
init()
document.getElementById('iconav').style.display = 'none'
window.infobox = infobox
window.init = init
//window.capture = capture
handleAction()
