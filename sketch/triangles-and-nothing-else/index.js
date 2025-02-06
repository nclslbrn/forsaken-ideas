import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import vertSrc from './glsl/triangles.vert'
import fragSrc from './glsl/triangles.frag'
import p5 from 'p5'

const containerElement = document.getElementById('windowFrame'),
    loader = document.getElementById('loading'),
    dpr = Math.round(window.devicePixelRatio) || 1,
    S = [1500, 2060]

let canvas, numSplit, grid, shader

const sketch = (p5) => {
    p5.setup = () => {
        canvas = p5.createCanvas(S[0], S[1], p5.WEBGL)
        shader = p5.createShader(vertSrc, fragSrc)
        p5.noStroke()
        p5.noLoop()
        sketch.shuffle()
    }
    p5.draw = () => {
        p5.blendMode()
        p5.shader(shader)
        shader.setUniform('u_resolution', [S[0] * dpr, S[1] * dpr])
        shader.setUniform('u_numCell', grid.length)
        shader.setUniform('u_cell', grid.flat())
        p5.rect(S * -0.5, S * -0.5, S, S)
    }
    
    sketch.splitCell = (cellIdx, isHorizontal, grid) => {
        if (grid[cellIdx] === undefined) return grid
        const [x, y, w, h] = grid[cellIdx]
        const c = 1 / Math.ceil(1 + Math.random() * 3)
        let splitted = []
        if (isHorizontal) {
            const ws = p5.shuffle([w * c, w * (1 - c)])
            splitted = [
                [x - w * 0.5 + ws[0] * 0.5, y, ws[0], h],
                [x + w * 0.5 - ws[1] * 0.5, y, ws[1], h]
            ]
        } else {
            const hs = p5.shuffle([h * c, h * (1 - c)])
            splitted = [
                [x, y - h * 0.5 + hs[0] * 0.5, w, hs[0]],
                [x, y + h * 0.5 - hs[1] * 0.5, w, hs[1]]
            ]
        }
        grid.splice(cellIdx, 1)
        grid.push(...splitted)
        return grid
    }
    sketch.capture = () => p5.saveCanvas(canvas, 'Triangles-and-nothing-else.jpg')
    sketch.shuffle = () => {
        numSplit = 2 + Math.ceil(Math.random() * 8)
        grid = [[0.5, 0.5, 1, 1]]
        for (let i = 0; i < numSplit; i++)
            grid = sketch.splitCell(
                Math.floor(Math.random() * grid.length),
                i % 2 === 0,
                grid
            )
        p5.redraw()
    }
}

new p5(sketch, containerElement)
containerElement.removeChild(loader)

window.shuffle = sketch.shuffle
window.capture = sketch.capture
window.infobox = infobox
handleAction()
