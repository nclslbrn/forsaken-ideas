import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import vertSrc from './glsl/base.vert'
import fragSrc from './glsl/base.frag'
import { canvasRecorder } from '@thi.ng/dl-asset'

let isRecording = false,
    recorder = false,
    traits = {}

const { floor, ceil, random } = Math

const shuffle = (array) => array.sort(() => 0.5 - random())

const splitCell = (cellIdx, isHorizontal, grid) => {
    if (grid[cellIdx] === undefined) return grid
    const [x, y, w, h] = grid[cellIdx]
    const c = 1 / ceil(1 + random() * 2)
    let splitted = []
    if (isHorizontal) {
        const ws = shuffle([w * c, w * (1 - c)])
        splitted = [
            [x - w * 0.5 + ws[0] * 0.5, y, ws[0], h],
            [x + w * 0.5 - ws[1] * 0.5, y, ws[1], h]
        ]
    } else {
        const hs = shuffle([h * c, h * (1 - c)])
        splitted = [
            [x, y - h * 0.5 + hs[0] * 0.5, w, hs[0]],
            [x, y + h * 0.5 - hs[1] * 0.5, w, hs[1]]
        ]
    }
    grid.splice(cellIdx, 1)
    grid.push(...splitted)
    return grid
}
const capture = (canvas) => {
    const link = document.createElement('a')
    link.download = `geometric-art.jpg`
    link.href = canvas.toDataURL('image/jpg')
    link.click()
}

const startRecording = (canvas) => {
    if (isRecording) return
    recorder = canvasRecorder(
        canvas,
        'geometric-art',
        {
            mimeType: 'video/webm;codecs=vp8',
            fps: 30
        }
    )
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
    init: () => {
        const numCell = 4 + ceil(random() * 12)
        let cells = [[0.5, 0.5, 1, 1]]

        for (let i = 0; i < numCell; i++)
            cells = splitCell(
                floor(random() * cells.length),
                i % 2 === 0,
                cells
            )

        traits = {
            noiseSeed: random() * 999,
            noiseSize: 1 + random(),
            numCell,
            cells
        }
        sketch.render()
    },
    setup: () => {
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
            positionLoc = gl.getAttribLocation(program, 'a_position')

        sketch.uTimeLoc = gl.getUniformLocation(program, 'u_time'),
        sketch.uResolution = gl.getUniformLocation(program, 'u_resolution'),
        sketch.uNoiseSeed = gl.getUniformLocation(program, 'u_noiseSeed'),
        sketch.uNoiseSize = gl.getUniformLocation(program, 'u_noiseSize'),
        sketch.uNumCell = gl.getUniformLocation(program, 'u_numCell'),
        sketch.uCells = gl.getUniformLocation(program, 'u_cells')

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)
        gl.enableVertexAttribArray(positionLoc)
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)
        gl.disable(gl.DEPTH_TEST)
        gl.enable(gl.BLEND)
        sketch.init()
        //startRecording(canvas)

        gl.clearColor(1, 1, 1, 1)
        sketch.render()
    },
    render: () => {
        //frame === 100 && stopRecording()
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.uniform1f(sketch.uTimeLoc, sketch.frame * 0.01)
        gl.uniform2f(sketch.uResolution, canvas.width, canvas.height)
        gl.uniform1f(sketch.uNoiseSeed, traits.noiseSeed)
        gl.uniform1f(sketch.uNoiseSize, traits.noiseSize)
        gl.uniform1i(sketch.uNumCell, traits.numCell)
        gl.uniform4fv(
            sketch.uCells,
            traits.cells.reduce((s, c) => [...s, ...c], [])
        )
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

        sketch.frame++
        //requestAnimationFrame(sketch.render)
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
window.randomize = sketch.init
window.capture = () => capture(canvas)

window.onkeydown = (e) => {
    if (e.key.toLowerCase() === 'r') startRecording(canvas)
    if (e.key.toLowerCase() === 's') stopRecording()
    if (e.key.toLowerCase() === 'g') init()
}

handleAction()
