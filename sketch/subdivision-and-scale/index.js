import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'

import vertSrc from './glsl/triangles.vert'
import fragSrc from './glsl/triangles.frag'

import { createShader, createProgram } from '../../sketch-common/shaderUtils'
import SvgTracer from '../../sketch-common/svg-tracer'
import { fillWithStraightLines } from '../../sketch-common/fillShape'

let traits = {}

const containerElement = document.getElementById('windowFrame'),
    loader = document.getElementById('loading'),
    canvas = document.createElement('canvas'),
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true }),
    dpi = 300,
    svg = new SvgTracer({
        parentElem: containerElement,
        size: 'A3_portrait',
        background: '#e8ca55',
        dpi
    }),
    margin = svg.cmToPixels(2.5),
    groupName = ['primary', 'secondary'],
    S = [1122.52, 1587.402],
    { floor, ceil, random } = Math,
    shuffle = (array) => array.sort(() => 0.5 - random())

const chunkify = (arr, itemPerChunk, itemBetweenChunk) => 
  arr.reduce((stack, line) => [
    ...stack,
    ...line.reduce((dash, pt, ptIdx) => {
      const dashIdx = floor(ptIdx / (itemPerChunk + itemBetweenChunk))
      const ptInDash = ptIdx % (itemPerChunk + itemBetweenChunk)
      if (!dash[dashIdx]) dash[dashIdx] = []
      if (ptInDash <= itemPerChunk) dash[dashIdx].push(pt)
          
      return dash
    }, [])
  ], [])

  

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

const sketch = {
    init: () => {
        const numCell = 4 + ceil(random() * 8)
        let cells = [[0.5, 0.5, 1, 1]]

        for (let i = 0; i < numCell; i++)
            cells = splitCell(
                floor(random() * cells.length),
                i % 2 === 0,
                cells
            )

        traits = { numCell, cells }
        sketch.render()
        sketch.exportSvg()
    },
    setup: () => {
        if (!gl) {
            console.error('WebGL not supported')
            return
        }

        canvas.width = S[0]
        canvas.height = S[1]

        gl.viewport(0, 0, canvas.width, canvas.height)

        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertSrc),
            fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragSrc),
            program = createProgram(gl, vertexShader, fragmentShader)

        gl.useProgram(program)

        const buffer = gl.createBuffer(),
            verts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
            positionLoc = gl.getAttribLocation(program, 'a_position')

        sketch.uResolution = gl.getUniformLocation(program, 'u_resolution')
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
        gl.uniform2f(sketch.uResolution, canvas.width, canvas.height)
        gl.uniform1i(sketch.uNumCell, traits.numCell)
        gl.uniform4fv(
            sketch.uCells,
            traits.cells.reduce((s, c) => [...s, ...c], [])
        )
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    },
    exportSvg: () => {
        const innerDiag = random() > .5 ? 2 : 3
        const outerDiag = innerDiag === 2 ? 3 : 2 
        
        svg.clearGroups() 
        Array(
            ...chunkify(
                fillWithStraightLines(canvas, (rgb) => rgb[0] < 128, 3, innerDiag).filter((_, i) => i % 10 !== 0),
                360, 
                12
            ),
            ...chunkify(
                fillWithStraightLines(canvas, (rgb) => rgb[0] < 128, 3, floor(random() * 2)).filter((_, i) => i % 5 !== 0),
                240, 
                12
            ),
            ...chunkify(
              fillWithStraightLines(canvas, (rgb) => rgb[0] > 128, 12, 0)
                .map((ln, i) => i % 7 ? ln : ln.reverse()),
              300, 10
            )
     
        ).reduce((g, line, lIdx) => 
          lIdx % floor(5 + random() * 20) ? 
            lIdx % floor(10 + random() * 50) 
              // assign to g[color 1] or g[color 2] 
              ? [[...g[0], line], g[1]] : [g[0], [...g[1], line]]
              // remove the line
              : g, 
          [[], []]
        ).reduce((g, line) => [ // split each line
                ...g, 
                [...chunkify(line, 120, 32)]
            ], []
        ).forEach((lines, gIdx) => {
          lines.forEach((line) => 
            svg.path({
              points: line.map((v) => [
                    margin + (v[0] / canvas.width) * (svg.width - margin * 2),
                    margin + (v[1] / canvas.height) * (svg.height - margin * 2)
              ]),
              group: groupName[gIdx],
              close: false,
              strokeLinecap: 'round' 
            })
          ) 
       })
      
    }
}
containerElement.removeChild(loader)
containerElement.appendChild(canvas)
svg.init()
svg.elem.style.maxWidth = '100%'
svg.elem.style.maxHeight = '120%'
svg.group({ name: groupName[1], stroke: 'white', strokeWidth: svg.cmToPixels(.03) })
svg.group({ name: groupName[0], stroke: '#000000f3', strokeWidth: svg.cmToPixels(.04) })
sketch.setup()
sketch.init()

window.init = sketch.init
window.capture = () => 
  svg.exportPng({
        name: `Variationes-circa-triangula_std_IV_Nicolas_Lebrun__${new Date().toISOString()}`,
        quality: 1
  })
window.download = () =>
    svg.export({
        name: `Variationes-circa-triangula_std_IV_Nicolas_Lebrun__${new Date().toISOString()}`
    })
window.infobox = infobox
handleAction()
