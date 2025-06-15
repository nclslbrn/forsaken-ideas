import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import vertSrc from './glsl/base.vert'
import fragSrc from './glsl/base.frag'

import { createShader, createProgram } from '../../sketch-common/shaderUtils'
import SvgTracer from '../../sketch-common/svg-tracer'
import { fillWithStraightLines } from '../../sketch-common/fillShape'
import { getPalette } from '@nclslbrn/artistry-swatch'

let traits = {}

const { floor, ceil, random } = Math
const shuffle = (array) => array.sort(() => 0.5 - random())

const containerElement = document.getElementById('windowFrame'),
    loader = document.getElementById('loading'),
    canvas = document.createElement('canvas'),
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true }),
    dpi = 300,
    svg = new SvgTracer({
        parentElem: containerElement,
        size: 'A3_portrait',
        background: '#f1f1f1',
        dpi
    }),
    margin = svg.cmToPixels(1.5)

/**
 * split a line in small parts (chunk)
 * @constructor
 * @param {array} arr - the line [[x0,y0], [x1,y1]...]
 * @param {number} itemperchunk - how many points in a chunk
 * @param {number} itembetweenchunk - how many element (to remove between each pars)
 */
const chunkify = (arr, itemperchunk, itembetweenchunk) =>
    arr.length > itembetweenchunk + itembetweenchunk
        ? arr.reduce(
              (stack, line) => [
                  ...stack,
                  ...line.reduce((dash, pt, ptidx) => {
                      const dashidx = floor(
                          ptidx / (itemperchunk + itembetweenchunk)
                      )
                      const ptindash = ptidx % (itemperchunk + itembetweenchunk)
                      if (dash[dashidx] === undefined) dash[dashidx] = []
                      if (ptindash <= itemperchunk) dash[dashidx].push(pt)

                      return dash
                  }, [])
              ],
              []
          )
        : arr

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
        const numCell = 4 + ceil(random() * 14)
        let cells = [[0.5, 0.5, 1, 1]]

        for (let i = 0; i < numCell; i++)
            cells = splitCell(
                floor(random() * cells.length),
                i % 2 === 0,
                cells
            )

        traits = {
            noiseSeed: random() * 999,
            noiseSize: 2 + random() * 10,
            palette: getPalette(),
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

        canvas.width = svg.width / 2
        canvas.height = svg.height / 2
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
            svg.group({ name: `color-${i}`, stroke: c, strokeWidth: 6 })
        })
        const scanLines = [],
            threshold = 4
        for (let i = 1; i < 50; i++) {
            scanLines.push(
                fillWithStraightLines(
                    canvas,
                    (rgb) =>
                        rgb[0] < i * threshold && rgb[0] > (i - 1) * threshold,
                    (4 + (i % 4)) * 2,
                    i % 4
                )
            )
        }
        //scanLines.map(lns => lns.map(ln => console.log(ln.length)))
        const alternativelyReverted = scanLines.map((lns) =>
            lns.map((ln, i) => (i % 10 === 0 ? ln.reverse() : ln))
        )
        const grouped = alternativelyReverted.reduce(
            (g, lns, lidx, arr) => {
                const gidx = Math.floor(
                    (lidx / arr.length) * traits.palette.colors.length
                )

                g[
                    lidx % 12 === 0
                        ? gidx
                        : (gidx + 1) % traits.palette.colors.length
                ].push(
                    ...(lidx % 8 === 0
                        ? chunkify(
                              lns,
                              floor(20 + random() * 20),
                              floor(10 + random() * 5)
                          )
                        : lns)
                )
                return g
            },
            traits.palette.colors.map(() => [])
        )

        const inner = [svg.width, svg.height].map((d) => d - margin * 2)
        grouped.map((group, i) => {
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
containerElement.appendChild(canvas)
svg.init()
sketch.setup()
sketch.init()

svg.elem.addEventListener('click', () => (svg.elem.style.display = 'none'))

window['infobox'] = infobox
window['randomize'] = sketch.init
window['capture'] = () => capture(canvas)
window['downloadSVG'] = () =>
    svg.export({
        name: `2025-04-30_Nicolas_Lebrun__${new Date().toISOString()}`
    })
window['downloadPNG'] = () =>
    svg.exportPng({
        name: `2025-04-30_Nicolas_Lebrun__${new Date().toISOString()}`,
        quality: 1
    })
window.onkeydown = (e) => {
    if (e.key.toLowerCase() === 'g') init()
}

handleAction()
