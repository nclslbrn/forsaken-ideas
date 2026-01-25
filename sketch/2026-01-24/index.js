import { pickRandom } from '@thi.ng/random'
import { FMT_yyyyMMdd_HHmmss } from '@thi.ng/date'
import { resolveState } from './state'

import { convert, mul, quantity, NONE, mm, dpi, DIN_A3 } from '@thi.ng/units'
import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { createShader, createProgram } from '../../sketch-common/shaderUtils'
import vertSrc from './glsl/shader.vert'
import fragSrc from './glsl/shader.frag'

const DPI = quantity(96, dpi), // default settings in inkscape
    [width, height] = mul(DIN_A3, DPI).deref(),
    margin = convert(mul(quantity(15, mm), DPI), NONE),
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
        state = resolveState({ width, height, margin })
    },
    setup: () => {
        if (!_.gl) {
            console.error('WebGL not supported')
            return
        }
        console.log(state)
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
            borderWidth: _.gl.getUniformLocation(program, 'u_borderWidth'),
            bgColor: _.gl.getUniformLocation(program, 'u_bgColor'),
            borderColor: _.gl.getUniformLocation(program, 'u_borderColor'),
            cellColor: _.gl.getUniformLocation(program, 'u_cellColor')
        }
        _.gl.bindBuffer(_.gl.ARRAY_BUFFER, buffer)
        _.gl.bufferData(_.gl.ARRAY_BUFFER, verts, _.gl.STATIC_DRAW)
        _.gl.enableVertexAttribArray(positionLoc)
        _.gl.vertexAttribPointer(positionLoc, 2, _.gl.FLOAT, false, 0, 0)
        _.gl.disable(_.gl.DEPTH_TEST)
        _.gl.enable(_.gl.BLEND)
        _.init()
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
        _.gl.uniform1iv(_.uniforms.cellType, grid.cellType.flat())
    }
}

_.setup()
window.init = _.init

window['exportJPG'] = () => {
    downloadCanvas(canvas, `2026 01 24-${FMT_yyyyMMdd_HHmmss()}`, 'jpeg', 1)
}

window.infobox = infobox
handleAction()
