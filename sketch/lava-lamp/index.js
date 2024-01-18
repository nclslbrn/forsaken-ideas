import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { createNoise2D } from 'simplex-noise'

const containerElement = document.getElementById('windowFrame'),
    loader = document.getElementById('loading'),
    canvas = document.createElement('canvas'),
    gl = canvas.getContext('webgl'),
    startTime = new Date().getTime(),
    noise = createNoise2D(),
    minmax = (min, max) => min + Math.random() * (max - min)

let mouseX = 0,
    mouseY = 0,
    particles = [],
    width,
    height

async function loadShaderAndRun() {
    const vert = await fetch('./assets/shader.vert').then((r) => r.text())
    const frag = await fetch('./assets/shader.frag').then((r) => r.text())

    const createParticles = (num) => {
        particles = []
        for (let i = 0; i < num; i++) {
            particles[i] = [minmax(0, 1), minmax(-0.5, 1.5), minmax(0.01, 0.09)]
        }
    }
    const updateParticles = () => {
        for (let i = 0; i < particles.length; i++) {
            if (particles[i][1] < -0.1) {
                particles[i][1] = 1.1
            } else if (particles[i][1] > 1.1) {
                particles[i][1] = -0.1
            } else {
                const a = Math.PI * 2 * noise(particles[i][0], particles[i][1])
                particles[i][0] += Math.cos(a) * 0.0005
                particles[i][1] += Math.sin(a) * 0.0005
                particles[i][1] += 0.001
            }
            if (particles[i][0] < -0.1) {
                particles[i][0] = 1.1
            }
            if (particles[i][0] > 1.1) {
                particles[i][0] = -0.1
            }
        }
    }

    const animate = () => {
        const now = new Date().getTime()
        const currentTime = (now - startTime) / 1000
        updateParticles()
        uTime.set(currentTime)
        uMouse.set(mouseX, mouseY)
        uPart.set(particles.flat())
        billboard.render(gl)
        requestAnimationFrame(animate)
    }

    const resize = () => {
        width = canvas.width = window.innerWidth
        height = canvas.height = window.innerHeight
        uResolution.set(width, height)
        gl.viewport(0, 0, width, height)
    }

    const addShader = (source, type) => {
        const shader = gl.createShader(type)
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        const isCompiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
        if (!isCompiled) {
            throw new Error(
                'Shader compile error: ' + gl.getShaderInfoLog(shader)
            )
        }
        gl.attachShader(program, shader)
    }

    class Uniform {
        constructor(name, suffix) {
            this.name = name
            this.suffix = suffix
            this.location = gl.getUniformLocation(program, name)
        }
        set(...values) {
            const method = 'uniform' + this.suffix
            const args = [this.location].concat(values)
            gl[method].apply(gl, args)
        }
    }

    class Rect {
        constructor(gl) {
            this.verts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
            const buffer = gl.createBuffer()
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
            gl.bufferData(gl.ARRAY_BUFFER, this.verts, gl.STATIC_DRAW)
        }
        render(gl) {
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        }
    }
    // create program
    const program = gl.createProgram()
    // add shaders
    addShader(vert, gl.VERTEX_SHADER)
    addShader(frag, gl.FRAGMENT_SHADER)
    // link & use program
    gl.linkProgram(program)
    gl.useProgram(program)

    // create fragment uniforms
    const uResolution = new Uniform('u_resolution', '2f'),
        uMouse = new Uniform('u_mouse', '2f'),
        uTime = new Uniform('u_time', '1f'),
        uPart = new Uniform('u_part', '3fv'),
        billboard = new Rect(gl),
        positionLocation = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
    createParticles(24)
    resize()
    animate()
    windowFrame.appendChild(canvas)
    window.addEventListener('resize', resize)
    document.addEventListener('mousemove', function (event) {
        mouseX = event.pageX
        mouseY = height - event.pageY
    })
    containerElement.removeChild(loader)
    window.infobox = infobox
    // window.init = clouds.init
    // window.capture = clouds.capture
    handleAction()
}
loadShaderAndRun()
