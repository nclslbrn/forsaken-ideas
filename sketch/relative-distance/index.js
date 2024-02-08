import { getPalette } from '@nclslbrn/artistry-swatch'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'

const containerElement = document.getElementById('windowFrame'),
    loader = document.getElementById('loading'),
    canvas = document.createElement('canvas'),
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true }),
    startTime = new Date().getTime()

let mouseX = 0, mouseY = 0

const capture = () => {
    const link = document.createElement('a')
    link.download = `relative-distance-${new Date().getTime()}.jpg`
    link.href = canvas.toDataURL('image/jpg')
    link.click()
}
const hex2Vec3 = (hex) => {
  hex = hex.replace(/^#/, '');
  // Convert the hex code to RGB values (revert opacity to 1)
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  return [r, g, b];
}


async function loadShaderAndRun() {
    const vert = await fetch('./assets/shader.vert').then((r) => r.text())
    const frag = await fetch('./assets/shader.frag').then((r) => r.text())
    const palette = getPalette()

    const animate = () => {
        const now = new Date().getTime()
        const currentTime = (now - startTime) / 10000
        uTime.set(currentTime)
        uMouse.set(mouseX, mouseY)
        billboard.render(gl)
        requestAnimationFrame(animate)
    }

    const resize = () => {
        const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        canvas.width = window.innerWidth * dpr
        canvas.height = window.innerHeight * dpr
        canvas.style.width = window.innerWidth + 'px'
        canvas.style.height = window.innerHeight + 'px'
        uResolution.set(canvas.width, canvas.height)
        uBackground.set(...hex2Vec3(palette.background))
        uStroke.set(...hex2Vec3(palette.stroke))
        uPalNum.set(palette.colors.length)
        uPalCols.set(palette.colors.map(hex => hex2Vec3(hex)).flat())
        gl.viewport(0, 0, canvas.width, canvas.height)
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
        uBackground = new Uniform('u_background', '3f'),
        uStroke = new Uniform('u_stroke', '3f'),
        uPalCols = new Uniform('u_palCols', '3fv'),
        uPalNum = new Uniform('u_palNum', '1i'),
        billboard = new Rect(gl),
        positionLocation = gl.getAttribLocation(program, 'a_position')

    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    
    resize()
    animate()
    console.log(palette.meta.artist)
    windowFrame.appendChild(canvas)
    window.addEventListener('resize', resize)
    document.addEventListener('mousemove', function (event) {
        mouseX = event.pageX
        mouseY = canvas.height - event.pageY
    })
}
loadShaderAndRun()

containerElement.removeChild(loader)
window.infobox = infobox
window.init = loadShaderAndRun
window.capture = capture
handleAction()
