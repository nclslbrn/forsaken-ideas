import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import vertSrc from './glsl/base.vert'
import fragSrc from './glsl/base.frag'

let mouseX = 0.5,
    mouseY = 0.,
    moved = false

const capture = (canvas) => {
    const link = document.createElement('a')
    link.download = `make-something-with-no-randomness.jpg`
    link.href = canvas.toDataURL('image/jpg')
    link.click()
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

const setup = () => {
    if (!gl) {
        console.error('WebGL not supported')
        return
    }

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    gl.viewport(0, 0, canvas.width, canvas.height)

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertSrc),
        fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragSrc),
        program = createProgram(gl, vertexShader, fragmentShader)

    gl.useProgram(program)

    const buffer = gl.createBuffer(),
        verts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        positionLoc = gl.getAttribLocation(program, 'a_position'),
        uTimeLoc = gl.getUniformLocation(program, 'u_time'),
        uResolution = gl.getUniformLocation(program, 'u_resolution'),
        uMouse = gl.getUniformLocation(program, 'u_mouse')

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)
    gl.disable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    let frame = 0.5
    
    canvas.addEventListener('mousedown', () => {
        moved = true
    })
    canvas.addEventListener('touchstart', () => {
        moved = true
    })
    canvas.addEventListener('mousemove', (event) => {
      if (moved) {
        mouseX = (event.pageX / canvas.width) - .5
        mouseY = .5 - (event.pageY / canvas.height)
        render()
      }
    })
    canvas.addEventListener('touchmove', (event) => {
      if (moved) {
        mouseX = (event.changedTouches[0].screenX / canvas.width) - .5 
        mouseY = .5 - (event.changedTouches[0].screenY / canvas.height)
        render()
      }
    })
    canvas.addEventListener('click', () => {
        moved = false
    })
    canvas.addEventListener('touchend', () => {
        moved = false  
    })

    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.uniform1f(uTimeLoc, frame * 0.01)
        gl.uniform2f(uResolution, canvas.width, canvas.height)
        gl.uniform2f(uMouse, mouseX, mouseY)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

        frame++
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
window.infobox = infobox
window.capture = () => capture(canvas)
handleAction()
