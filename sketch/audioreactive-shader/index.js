import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { createShader, createProgram } from '../../sketch-common/shaderUtils'
import vertSrc from './glsl/base.vert'
import fragSrc from './glsl/base.frag'

const containerElement = document.getElementById('windowFrame'),
    loader = document.getElementById('loading'),
    canvas = document.createElement('canvas'),
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true }),
    { floor, ceil, random } = Math

const splitCell = (cellIdx, isHorizontal, grid) => {
    if (grid[cellIdx] === undefined) return grid
    const [x, y, w, h] = grid[cellIdx]
    let splitted = []
    if (isHorizontal) {
        const ws = [w * 0.5, w * 0.5]
        splitted = [
            [x - w * 0.5 + ws[0] * 0.5, y, ws[0], h],
            [x + w * 0.5 - ws[1] * 0.5, y, ws[1], h]
        ]
    } else {
        const hs = [h * 0.5, h * 0.5]
        splitted = [
            [x, y - h * 0.5 + hs[0] * 0.5, w, hs[0]],
            [x, y + h * 0.5 - hs[1] * 0.5, w, hs[1]]
        ]
    }
    grid.splice(cellIdx, 1)
    grid.push(...splitted)
    return grid
}

let audioContext,
    analyser,
    microphone,
    freqData,
    freqText,
    program,
    positionBuffer,
    timeUniform,
    resUniform,
    freqTextUniform,
    startTime,
    frameId,
    numCell,
    cells,
    numCellUniform,
    cellsUniform

const sketch = {
    init: function () {
        numCell = 6 + ceil(random() * 1)
        cells = [[0.5, 0.5, 1, 1]]

        for (let i = 0; i < numCell; i++)
            cells = splitCell(
                floor(random() * cells.length),
                i % 2 === 0,
                cells
            )
    },
    startAudio: async function () {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
                audio: true,
                video: false
            })
            audioContext = new (window.AudioContext ||
                window.webkitAudioContext)()
            analyser = audioContext.createAnalyser()
            microphone = audioContext.createMediaStreamSource(stream)
            analyser.fftSize = 512
            analyser.smoothingTimeConstant = 0.8
            microphone.connect(analyser)
            freqData = new Uint8Array(analyser.frequencyBinCount)
            freqText = gl.createTexture()
            gl.bindTexture(gl.TEXTURE_2D, freqText)

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

            startTime = new Date()
            sketch.animate()
        } catch (error) {
            console.error(
                'Micophone access denied or not available',
                error.message
            )
        }
    },
    stopAudio: function () {
        if (frameId) {
            cancelAnimationFrame(frameId)
            frameId = null
        }
        if (audioContext) {
            audioContext.close()
            audioContext = null
        }
        analyser = null
        microphone = null
    },
    setup: function () {
        if (!gl) {
            console.error('WebGL not supported')
            return
        }
        sketch.init()
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        gl.viewport(0, 0, canvas.width, canvas.height)
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertSrc),
            fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragSrc),
            positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])

        program = createProgram(gl, vertexShader, fragmentShader)

        gl.useProgram(program)

        timeUniform = gl.getUniformLocation(program, 'u_time')
        resUniform = gl.getUniformLocation(program, 'u_resolution')
        freqTextUniform = gl.getUniformLocation(program, 'u_freqTetxure')
        numCellUniform = gl.getUniformLocation(program, 'u_numCell')
        cellsUniform = gl.getUniformLocation(program, 'u_cells')

        positionBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
        gl.viewport(0, 0, canvas.width, canvas.height)
    },
    updateFreqText: function () {
        if (!analyser || !freqText) return
        analyser.getByteFrequencyData(freqData)
        gl.bindTexture(gl.TEXTURE_2D, freqText)
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.LUMINANCE,
            freqData.length,
            1,
            0,
            gl.LUMINANCE,
            gl.UNSIGNED_BYTE,
            freqData
        )
    },
    // Refresh data and draw vizualisation
    animate: function () {
        if (!gl || !program) return
        const currentTime = (Date.now() - startTime) * 0.001
        sketch.updateFreqText()
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.useProgram(program)

        gl.uniform1f(timeUniform, currentTime)
        gl.uniform2f(resUniform, canvas.width, canvas.height)
        gl.uniform1i(numCellUniform, numCell)
        gl.uniform4fv(
            cellsUniform,
            cells.reduce((s, c) => [...s, ...c], [])
        )

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, freqText)
        gl.uniform1i(freqTextUniform, 0)

        const positionAttribute = gl.getAttribLocation(program, 'a_position')
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
        gl.enableVertexAttribArray(positionAttribute)
        gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0)

        // Draw fullscreen quad
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        frameId = requestAnimationFrame(() => sketch.animate())
    }
}
containerElement.removeChild(loader)
containerElement.appendChild(canvas)
sketch.setup()
await sketch.startAudio()
window.infobox = infobox
handleAction()
