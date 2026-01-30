// import { pickRandom } from '@thi.ng/random'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import { resolveState } from './state'

import { downloadCanvas } from '@thi.ng/dl-asset'
// import { convert, mul, quantity, NONE, mm, dpi, DIN_A3 } from '@thi.ng/units'
import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { createShader, createProgram } from '../../sketch-common/shaderUtils'
import vertSrc from './glsl/shader.vert'
import fragSrc from './glsl/shader.frag'

const // DPI = quantity(96, dpi), // default settings in inkscape
    //[width, height] = mul(DIN_A3, DPI).deref(),
    [width, height] = [window.innerWidth, window.innerHeight].map((x) => x * 2),
    main = document.getElementById('windowFrame'),
    canvas = document.createElement('canvas'),
    loader = document.getElementById('loading')

let isRecording = false,
    isAnimated = false,
    recorder = false,
    frameReq = 0,
    state = null,
    gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true })

main.appendChild(canvas)

const _ = {
    frame: 0,
    frameRequest: null,
    uniforms: {},
    init: () => {
        if (!gl) {
            console.error('WebGL not supported')
            return
        }
        state = resolveState({ width, height })
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertSrc),
            fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragSrc),
            program = createProgram(gl, vertexShader, fragmentShader)

        gl.useProgram(program)

        const buffer = gl.createBuffer(),
            verts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
            positionLoc = gl.getAttribLocation(program, 'a_position')

        _.uniforms = {
            resolution: gl.getUniformLocation(program, 'u_resolution'),
            cellCount: gl.getUniformLocation(program, 'u_cellCount'),
            cells: gl.getUniformLocation(program, 'u_cells'),
            cellType: gl.getUniformLocation(program, 'u_cellType'),
            depthA: gl.getUniformLocation(program, 'u_depthA'),
            depthB: gl.getUniformLocation(program, 'u_depthB'),
            colorA: gl.getUniformLocation(program, 'u_colorA'),
            colorB: gl.getUniformLocation(program, 'u_colorB'),
            lightPos: gl.getUniformLocation(program, 'u_lightPos'),
            lightColor: gl.getUniformLocation(program, 'u_lightColor'),
            lightCount: gl.getUniformLocation(program, 'u_lightCount'),
            time: gl.getUniformLocation(program, 'u_time')
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)
        gl.enableVertexAttribArray(positionLoc)
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)
        gl.disable(gl.DEPTH_TEST)
        gl.enable(gl.BLEND)
        gl.clearColor(1, 1, 1, 1)

        if (_.frameRequest) cancelAnimationFrame(_.frameRequest)
        console.log(
            'cell length',
            state.subcells.cells.length,
            'light length',
            state.subcells.lights.length
        )
        _.render()
    },
    render: () => {
        const { subcells: grid } = state
        _.frame++
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.uniform2f(_.uniforms.resolution, width, height)
        gl.uniform1i(_.uniforms.cellCount, grid.cells.length)
        gl.uniform4fv(
            _.uniforms.cells,
            grid.cells.reduce((acc, c) => [...acc, ...c], [])
        )
        gl.uniform1fv(_.uniforms.cellType, grid.cellType.flat())
        gl.uniform1f(_.uniforms.depthA, 0.25)
        gl.uniform1f(_.uniforms.depthB, 0.5)

        gl.uniform3f(_.uniforms.colorA, 0.0, 0.1, 1.0)
        gl.uniform3f(_.uniforms.colorB, 1.0, 0.0, 0.0)

        gl.uniform3fv(
            _.uniforms.lightPos,
            grid.lights.reduce((acc, l) => [...acc, ...l], [])
        )
        gl.uniform3f(_.uniforms.lightColor, 1.0, 1.0, 1.0)
        gl.uniform1i(_.uniforms.lightCount, grid.lights.length)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

        gl.uniform1f(_.uniforms.time, _.frame * 0.03)
        //
        // $_.frameRequest = requestAnimationFrame(_.render)
    }
}

_.init()
window.init = _.init

window['download'] = () => {
    downloadCanvas(canvas, `2026 01 24-${FMT_yyyyMMdd_HHmmss()}`, 'jpeg', 1)
}

window.infobox = infobox
handleAction()
