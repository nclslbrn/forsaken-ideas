import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import vertSrc from './glsl/generative-palette.vert'
import fragSrc from './glsl/generative-palette.frag'
import p5 from 'p5'

const containerElement = document.getElementById('windowFrame'),
    loader = document.getElementById('loading'),
    dpr = Math.round(window.devicePixelRatio) || 1

let canvas,
    shader,
    traits = {
        grid: [],
        noiseSize: 1,
        noiseSeed: 1
    }

const sketch = (p5) => {
    p5.setup = () => {
        canvas = p5.createCanvas(
            window.innerWidth,
            window.innerHeight,
            p5.WEBGL
        )
        shader = p5.createShader(vertSrc, fragSrc)
        p5.noStroke()
        p5.noLoop()
        sketch.shuffle()
    }
    p5.draw = () => {
        p5.blendMode()
        p5.shader(shader)
        shader.setUniform('u_resolution', [
            window.innerWidth * dpr,
            window.innerHeight * dpr
        ])
        shader.setUniform('u_numCell', traits.grid.length)
        shader.setUniform('u_cell', traits.grid.flat())
        shader.setUniform('u_noiseSize', traits.noiseSize)
        shader.setUniform('u_noiseSeed', traits.noiseSeed)
        shader.setUniform('u_hue', traits.hue)
        p5.rect(p5.width * -0.5, p5.height * -0.5, p5.width, p5.height)
    }

    sketch.splitCell = (cellIdx, isHorizontal, grid) => {
        if (grid[cellIdx] === undefined) return grid
        const [x, y, w, h] = grid[cellIdx]
        const c = 1 / Math.ceil(1+Math.random()*2)
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
    sketch.capture = () =>
        p5.saveCanvas(canvas, 'pure-black-and-white.jpg')

    sketch.shuffle = () => {
        const numSplit = 8 + Math.ceil(Math.random() * 50)
        traits.grid = [[0.5, 0.5, 1, 1]]
        for (let i = 0; i < numSplit; i++)
            traits.grid = sketch.splitCell(
                Math.floor(Math.random() * traits.grid.length),
                i % 2 === 0,
                traits.grid
            )
        traits.noiseSeed = Math.random() * 999
        traits.noiseSize = 2.5 + Math.random() * 5
        traits.hue = Math.random()
        p5.redraw()
    }
}

new p5(sketch, containerElement)
containerElement.removeChild(loader)

window.shuffle = sketch.shuffle
window.capture = sketch.capture
window.infobox = infobox
handleAction()
