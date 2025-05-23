import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import vertSrc from './glsl/base.vert'
import fragSrc from './glsl/base.frag'

import SvgTracer from '../../sketch-common/svg-tracer'
import { fillWithStraightLines } from '../../sketch-common/fillShape'
import { createShader, createProgram } from '../../sketch-common/shaderUtils'
import { getPalette } from '@nclslbrn/artistry-swatch'

let traits = {}

const { floor, ceil, random, pow } = Math
const shuffle = (array) => array.sort(() => 0.5 - random())

const containerElement = document.getElementById('windowFrame'),
    loader = document.getElementById('loading'),
    canvas = document.createElement('canvas'),
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true }),
    dpi = 300,
    svg = new SvgTracer({
        parentElem: containerElement,
        size: 'A3_square',
        background: 'white',
        dpi
    }),
    S = [2560, 2560],
    margin = svg.cmToPixels(1)
/**
 * split a line in small parts (chunk)
 * @constructor
 * @param {array} arr - the line [[x0,y0], [x1,y1]...]
 * @param {number} itemperchunk - how many split
 * @param {number} itembetweenchunk - how many element (to remove between each pars)
 */
const chunkify = (arr, itemperchunk, itembetweenchunk) =>
    arr.reduce(
        (stack, line) => [
            ...stack,
            ...line.reduce((dash, pt, ptidx) => {
                const dashidx = floor(ptidx / (itemperchunk + itembetweenchunk))
                const ptindash = ptidx % (itemperchunk + itembetweenchunk)
                if (!dash[dashidx]) dash[dashidx] = []
                if (ptindash <= itemperchunk) dash[dashidx].push(pt)

                return dash
            }, [])
        ],
        []
    )

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

const sketch = {
    init: () => {
        const numCell = 4 + ceil(random() * 24)
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
            palette: getPalette(), //{ artist: "Alfons Mucha" }),
            numCell,
            cells
        }
        console.log(traits)
        sketch.render()
        sketch.renderSvg()
    },
    setup: () => {
        if (!gl) {
            console.error('WebGL not supported')
            return
        }

        canvas.width = S[0]
        canvas.height = S[1]
        gl.viewport(0, 0, canvas.width, canvas.height)
        // Create shaders and program
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertSrc),
            fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragSrc),
            program = createProgram(gl, vertexShader, fragmentShader)

        gl.useProgram(program)

        const buffer = gl.createBuffer(),
            verts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
            positionLoc = gl.getAttribLocation(program, 'a_position')

        sketch.uTimeLoc = gl.getUniformLocation(program, 'u_time')
        sketch.uResolution = gl.getUniformLocation(program, 'u_resolution')
        sketch.uNoiseSeed = gl.getUniformLocation(program, 'u_noiseSeed')
        sketch.uNoiseSize = gl.getUniformLocation(program, 'u_noiseSize')
        sketch.uNumCell = gl.getUniformLocation(program, 'u_numCell')
        sketch.uCells = gl.getUniformLocation(program, 'u_cells')

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)
        gl.enableVertexAttribArray(positionLoc)
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)
        gl.disable(gl.DEPTH_TEST)
        gl.enable(gl.BLEND)

        gl.clearColor(1, 1, 1, 1)
    },

    render: () => {
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
    },

    renderSvg: () => {
        svg.clear()
        svg.rect({
            x: 0,
            y: 0,
            w: svg.width,
            h: svg.height,
            fill: traits.palette.background
        })
        traits.palette.colors.forEach((c, i) => {
            svg.group({ name: `color-${i}`, stroke: c, strokeWidth: 4 })
        })
        const scanLines = traits.palette.colors.map(() => [])
        for (let i = 1; i < 10; i++) {
            const j = i % traits.palette.colors.length,
                sc = 25.5
            scanLines[j].push(
                ...fillWithStraightLines(
                    canvas,
                    ([r, g, b]) =>
                        j > 1 
                        ? r < i * sc 
                        : j < 1 
                            ? g < i * sc
                            : b < i * sc,
                    pow(4, i*.5),
                    i % 4
                )
            )
        }
        const filtered = scanLines.map((group, i) =>
            group.filter((_, i) => i % 24 !== 0)
        )
        console.log(filtered.map((ln) => ln[0].length))
        const sliced = filtered.map((g) => g.reduce((ls, ln, i) => [...ls, i % 5 ? chunkify(ln, 80, 20): chunkify(ln, 100, 10)]))
        /* 
        const grouped = sliced.reduce((g, ln, lidx) => {
                  g[lidx % traits.palette.colors.length].push(ln)
                  return g
                },
                traits.palette.colors.map(() => [])
            )
        */
        const inner = [svg.width, svg.height].map((d) => d - margin * 2)
        sliced.map((group, i) => {
            group.map((ln) => {
                svg.path({
                    points: ln.map((v) => [
                        margin + (v[0] / canvas.width) * inner[0],
                        margin + (v[1] / canvas.height) * inner[1]
                    ]),
                    fill: 'none',
                    close: false,
                    strokeLinecap: 'round',
                    group: `color-${i}`
                })
            })
        })
    }
}
containerElement.removeChild(loader)
svg.init()
/*
containerElement.style.gridTemplateRows = '1.5vw 48vw 1vw 48vw 1.5vw'
containerElement.appendChild(canvas)
svg.elem.style.gridColumnStart = '4'
*/
sketch.setup()
sketch.init()

window['infobox'] = infobox
window['randomize'] = sketch.init
window['capture'] = () => capture(canvas)
window['downloadSVG'] = () =>
    svg.export({
        name: `nblp_p${traits.palette.meta.artist}_${new Date().toISOString()}`
    })
window['downloadPNG'] = () =>
    svg.exportPng({
        name: `nblp_p${traits.palette.meta.artist}_${new Date().toISOString()}`,
        quality: 1
    })
window.onkeydown = (e) => {
    if (e.key.toLowerCase() === 'g') init()
}

handleAction()
