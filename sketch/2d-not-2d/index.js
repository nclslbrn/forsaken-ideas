import { getPalette } from '@nclslbrn/artistry-swatch'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { isPowerOfTwo } from 'three/src/math/MathUtils'

const containerElement = document.getElementById('windowFrame'),
    loader = document.getElementById('loading'),
    canvas2d = document.createElement('canvas'),
    ctx = canvas2d.getContext('2d'),
    canvas3d = document.createElement('canvas'),
    gl = canvas3d.getContext('webgl', { preserveDrawingBuffer: true }),
    startTime = new Date().getTime()

let mouseX = 0,
    mouseY = 0

const capture = () => {
    const link = document.createElement('a')
    link.download = `relative-distance-${new Date().getTime()}.jpg`
    link.href = canvas3d.toDataURL('image/jpg')
    link.click()
}

const hex2Vec3 = (hex) => {
    hex = hex.replace(/^#/, '')
    // Convert the hex code to RGB values (revert opacity to 1)
    const r = parseInt(hex.substring(0, 2), 16) / 255
    const g = parseInt(hex.substring(2, 4), 16) / 255
    const b = parseInt(hex.substring(4, 6), 16) / 255
    return [r, g, b]
}

async function loadShaderAndRun() {
    const vert = await fetch('./assets/shader.vert').then((r) => r.text()),
        frag = await fetch('./assets/shader.frag').then((r) => r.text()),
        palette = getPalette(),
        //scale = 1 / Math.ceil(Math.random() * 10),
        cWidth = 4 * Math.round(window.innerWidth * 0.2),
        cHeight = 4 * Math.round(window.innerHeight * 0.2)
    console.table([cWidth, cHeight])

    const animate = () => {
        const now = new Date().getTime()
        const currentTime = (now - startTime) / 10000
        uTime.set(currentTime)
        uMouse.set(mouseX, mouseY)
        billboard.render(gl)
        requestAnimationFrame(animate)
    }

    const resize = () => {
        const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
        canvas3d.width = window.innerWidth * dpr
        canvas3d.height = window.innerHeight * dpr
        canvas3d.style.width = window.innerWidth + 'px'
        canvas3d.style.height = window.innerHeight + 'px'
        uResolution.set(canvas3d.width, canvas3d.height)
        uBackground.set(...hex2Vec3(palette.background))
        uStroke.set(...hex2Vec3(palette.stroke))
        uPalNum.set(palette.colors.length)
        uTexSize.set(cWidth, cHeight)
        uPalCols.set(palette.colors.map((hex) => hex2Vec3(hex)).flat())
        gl.viewport(0, 0, canvas3d.width, canvas3d.height)
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
  
    const isPowerOfTwo = (x) => (x & (x -1 )) == 0 

    const randGrey = () => {
        const value = (Math.random() * 0xff) | 0
        const grayscale = (value << 16) | (value << 8) | value
        return '#' + grayscale.toString(16)
    }

    const comp = () => {
        const chars = [...'INSIDE_CELL/\\']
        const cell = 16 + Math.floor(Math.random() * 4) * 4
        canvas2d.width = cWidth
        canvas2d.height = cHeight
        ctx.font = `${cell}px "Helvetica Neue", Helvetica, Arial, sans-serif`

        const grid = [cWidth / cell, cHeight / cell]
        for (let x = 0; x < grid[0]; x++) {
            for (let y = 0; y < grid[1]; y++) {
                ctx.fillStyle = randGrey()
                const l = chars[(x+y) % chars.length] 
                // ctx.fillRect(x * 20, y * 20, 20, 20)
                // ctx.fillStyle = randGrey()
                ctx.fillText(l !== undefined ? l : " ", x * cell, y * cell)
            }
        }
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
    comp()

    // create fragment uniforms
    const uResolution = new Uniform('u_resolution', '2f'),
        uMouse = new Uniform('u_mouse', '2f'),
        uTime = new Uniform('u_time', '1f'),
        uBackground = new Uniform('u_background', '3f'),
        uStroke = new Uniform('u_stroke', '3f'),
        uPalCols = new Uniform('u_palCols', '3fv'),
        uPalNum = new Uniform('u_palNum', '1i'),
        uTexSize = new Uniform('u_texSize', '2f'),
        billboard = new Rect(gl),
        positionLocation = gl.getAttribLocation(program, 'a_position'),
        texture = gl.createTexture()
  
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        canvas2d
    )
    if (isPowerOfTwo(canvas2d.width) && isPowerOfTwo(canvas2d.height)) {
      gl.generateMipmap(gl.TEXTURE_2D)
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

    gl.useProgram(program)

    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    gl.enableVertexAttribArray(uTexSize)
    gl.vertexAttribPointer(uTexSize, 2, gl.FLOAT, false, 0, 0)

    //uTexture.set(0)
    gl.disable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)

    resize()
    animate()
    console.log(palette.meta.artist)
    windowFrame.appendChild(canvas3d)
    window.addEventListener('resize', resize)
    document.addEventListener('mousemove', function (event) {
        mouseX = event.pageX
        mouseY = canvas3d.height - event.pageY
    })
}
loadShaderAndRun()

containerElement.removeChild(loader)
window.infobox = infobox
window.init = loadShaderAndRun
window.capture = capture
handleAction()
