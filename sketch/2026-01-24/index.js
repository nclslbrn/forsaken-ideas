import { pickRandom } from '@thi.ng/random'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import { resolveState } from './state'

import { convert, mul, quantity, NONE, mm, dpi, DIN_A3 } from '@thi.ng/units'
import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { createShader, createProgram } from '../../sketch-common/shaderUtils'
import vertSrc from './glsl/shader.vert'
import fragSrc from './glsl/shader.frag'

const DPI = quantity(96, dpi), // default settings in inkscape
    //[width, height] = mul(DIN_A3, DPI).deref(),
    [width, height] = [window.innerWidth, window.innerHeight],
    main = document.getElementById('windowFrame'),
    canvas = document.createElement('canvas'),
    loader = document.getElementById('loading')

let isRecording = false,
    isAnimated = false,
    recorder = false,
    frameReq = 0,
    state = null

main.appendChild(canvas)

const _ = {
    gl: canvas.getContext('webgl', { preserveDrawingBuffer: true }),
    frame: 0,
    state: {},
    uniforms: {},
    init: () => {
        state = resolveState({ width, height })
        if (!_.gl) {
            console.error('WebGL not supported')
            return
        }
        canvas.width = width
        canvas.height = height
        _.gl.viewport(0, 0, width, height)
        const vertexShader = createShader(_.gl, _.gl.VERTEX_SHADER, vertSrc),
            fragmentShader = createShader(_.gl, _.gl.FRAGMENT_SHADER, fragSrc),
            program = createProgram(_.gl, vertexShader, fragmentShader)

        _.gl.useProgram(program)

        const buffer = _.gl.createBuffer(),
            verts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
            positionLoc = _.gl.getAttribLocation(program, 'a_position')

        _.uniforms = {
            resolution: _.gl.getUniformLocation(program, 'u_resolution'),
            cellCount: _.gl.getUniformLocation(program, 'u_cellCount'),
            cells: _.gl.getUniformLocation(program, 'u_cells'),
            cellType: _.gl.getUniformLocation(program, 'u_cellType'),
            depthA: _.gl.getUniformLocation(program, 'u_depthA'),
            depthB: _.gl.getUniformLocation(program, 'u_depthB'),
            colorA: _.gl.getUniformLocation(program, 'u_colorA'),
            colorB: _.gl.getUniformLocation(program, 'u_colorB'),
            lightPos: _.gl.getUniformLocation(program, 'u_lightPos'),
            lightColor: _.gl.getUniformLocation(program, 'u_lightColor'),
            lightCount: _.gl.getUniformLocation(program, 'u_lightCount')
        }
        _.gl.bindBuffer(_.gl.ARRAY_BUFFER, buffer)
        _.gl.bufferData(_.gl.ARRAY_BUFFER, verts, _.gl.STATIC_DRAW)
        _.gl.enableVertexAttribArray(positionLoc)
        _.gl.vertexAttribPointer(positionLoc, 2, _.gl.FLOAT, false, 0, 0)
        _.gl.disable(_.gl.DEPTH_TEST)
        _.gl.enable(_.gl.BLEND)
        _.gl.clearColor(1, 1, 1, 1)
        _.render()
    },
    render: () => {
        const { subcells: grid } = state

        _.gl.clear(_.gl.COLOR_BUFFER_BIT)
        _.gl.uniform2f(_.uniforms.resolution, width, height)
        _.gl.uniform1i(_.uniforms.cellCount, grid.cells.length)
        _.gl.uniform4fv(
            _.uniforms.cells,
            grid.cells.reduce((acc, c) => [...acc, ...c], [])
        )
        _.gl.uniform1fv(_.uniforms.cellType, grid.cellType.flat())
        _.gl.uniform1f(_.uniforms.depthA, 0.5)
        _.gl.uniform1f(_.uniforms.depthB, 0.25)

        _.gl.uniform3f(_.uniforms.colorA, 0.0, 1.0, 1.0)
        _.gl.uniform3f(_.uniforms.colorB, 1.0, 1.0, 0.0)

        _.gl.uniform3fv(
            _.uniforms.lightPos,
            grid.lights.reduce((acc, c) => [...acc, ...c], [])
        )
        _.gl.uniform3f(_.uniforms.lightColor, 1.0, 1.0, 1.0)
        _.gl.uniform1i(_.uniforms.lightCount, grid.lights.length)
        _.gl.drawArrays(_.gl.TRIANGLE_STRIP, 0, 4)
    }
}

_.init()
window.init = _.init

window['exportJPG'] = () => {
    downloadCanvas(canvas, `2026 01 24-${FMT_yyyyMMdd_HHmmss()}`, 'jpeg', 1)
}

window.infobox = infobox
handleAction()
