import * as tome from 'chromotome'
import AutomataGrid from '../../src/js/sketch-common/AutomataGrid'
import MirrorShape from './MirrorShape'

let palette, cellSize

const svgSize = () => {
    const side = Math.min(window.innerWidth, window.innerHeight)
    return {
        w: side > 800 ? 800 : side * 0.85,
        h: side > 800 ? 800 : side * 0.85
    }
}
const rect = (x = 0, y = 0, width = 0, height = 0, color) => {
    const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    r.setAttributeNS(null, 'x', x)
    r.setAttributeNS(null, 'y', y)
    r.setAttributeNS(null, 'width', width)
    r.setAttributeNS(null, 'height', height)
    r.setAttributeNS(null, 'fill', color)
    mainSVG.appendChild(r)
}
const triangle = (x1, y1, x2, y2, z1, z3) => {
    const t = document.createElementNS()
}
const fillCell = (x, y, color) => {
    mirror.allCorners(x, y).forEach((p) => {
        rect(
            p[0] * cellSize.w,
            p[0] * cellSize.h,
            cellSize.w,
            cellSize.h,
            color
        )
    })
}
// Create container
const svgFrameSize = svgSize()
const mainSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
mainSVG.id = 'frame'
mainSVG.setAttributeNS(null, 'width', svgFrameSize.w)
mainSVG.setAttributeNS(null, 'height', svgFrameSize.h)
document.body.appendChild(mainSVG)

// Setup automata

const g = new AutomataGrid(5, 5)
cellSize = {
    w: svgFrameSize.w / (1 + g.cols * 2),
    h: svgFrameSize.h / (1 + g.rows * 2)
}
const mirror = new MirrorShape(g.cols, g.rows)
const paramBox = document.createElement('div')
paramBox.id = 'interactiveParameter'

const updateButton = document.createElement('button')
updateButton.innerText = 'Update the grid'
paramBox.appendChild(updateButton)
updateButton.addEventListener(
    'click',
    (event) => {
        sketch.update()
    },
    false
)

const colorButton = document.createElement('button')
colorButton.innerText = 'Change color'
paramBox.appendChild(colorButton)
colorButton.addEventListener(
    'click',
    (event) => {
        sketch.changeColor()
    },
    false
)
document.body.appendChild(paramBox)
const init = () => {
    g.init()
}
const print = () => {
    mainSVG.childNodes.forEach((child) => child.remove())
    rect(
        0,
        0,
        svgFrameSize.w,
        svgFrameSize.h,
        palette.background || palette.stroke || 100
    )
    for (let x = 0; x <= g.cols; x++) {
        for (let y = 0; y <= g.rows; y++) {
            const i = x * g.cols + y
            if (g.value[i - g.rows] && g.value[i + g.rows]) {
                fillCell(x, y, palette.colors[i % palette.colors.length])
                fillCell(x, y - 1, palette.colors[i % palette.colors.length])
                fillCell(x, y + 1, palette.colors[i % palette.colors.length])
            }
            // left & right
            if (g.value[i + g.cols] && g.value[i - g.cols]) {
                fillCell(x, y, palette.colors[i % palette.colors.length])
                fillCell(x - 1, y, palette.colors[i % palette.colors.length])
                fillCell(x + 1, y, palette.colors[i % palette.colors.length])
            }
            /*  if (g.value[i - 1] && g.value[i - g.cols]) {
                fillCell(x, y, colors[i % colors.length])
                bottomRightTriangle(x - 1, y - 1, colors[i % colors.length])
            }
            if (g.value[i - 1] && g.value[i + g.cols]) {
                fillCell(x, y, colors[i % colors.length])
                bottomLeftTriangle(x + 1, y - 1, colors[i % colors.length])
            }
            if (g.value[i + 1] && g.value[i + g.cols]) {
                fillCell(x, y, colors[i % colors.length])
                topLeftTriangle(x + 1, y + 1, colors[i % colors.length])
            }
            if (g.value[i + 1] && g.value[i - g.cols]) {
                fillCell(x, y, colors[i % colors.length])
                topRightTriangle(x - 1, y + 1, colors[i % colors.length])
            } */
        }
    }
}
const update = () => {
    g.update()
}
const changeColor = () => {
    palette = tome.get()
}

const sketch = {
    init: () => {
        init()
        changeColor()
        update()
        print()
    },
    update: () => {
        update()
        print()
    },
    changeColor: () => {
        changeColor()
        print()
    }
}

export default sketch
