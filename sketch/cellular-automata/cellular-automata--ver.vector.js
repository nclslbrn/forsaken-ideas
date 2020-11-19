import * as tome from 'chromotome'
import AutomataGrid from '../../src/js/sketch-common/AutomataGrid'
import MirrorShape from './MirrorShape'
import exportSVG from '../../src/js/sketch-common/exportSVG'

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
    r.setAttribute('x', x)
    r.setAttribute('y', y)
    r.setAttribute('width', width)
    r.setAttribute('height', height)
    r.setAttribute('fill', color)
    mainSVG.appendChild(r)
}
const triangle = (p = [], color) => {
    const _x = (v) => {
        return v * cellSize.w
    }
    const _y = (v) => {
        return v * cellSize.h
    }

    const t = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    t.setAttribute(
        'd',
        String(
            'M ' +
                _x(p[0]) +
                ',' +
                _y(p[1]) +
                'L ' +
                _x(p[2]) +
                ',' +
                _y(p[3]) +
                'L ' +
                _x(p[4]) +
                ',' +
                _y(p[5]) +
                'Z'
        )
    )
    t.setAttribute('fill', color)
    mainSVG.appendChild(t)
}
const fillCell = (x, y, color) => {
    mirror.allCorners(x, y).forEach((p) => {
        rect(
            p[0] * cellSize.w,
            p[1] * cellSize.h,
            cellSize.w,
            cellSize.h,
            color
        )
    })
}
const topLeftTriangle = (x, y, color) => {
    mirror.topLeftCorner(x, y).forEach((p) => {
        triangle(p, color)
    })
}

const topRightTriangle = (x, y, color) => {
    mirror.topRightCorner(x, y).forEach((p) => {
        triangle(p, color)
    })
}

const bottomRightTriangle = (x, y, color) => {
    mirror.bottomRightCorner(x, y).forEach((p) => {
        triangle(p, color)
    })
}

const bottomLeftTriangle = (x, y, color) => {
    mirror.bottomLeftCorner(x, y).forEach((p) => {
        triangle(p, color)
    })
}

// Create container
const svgContainer = document.createElement('div')
svgContainer.id = 'frame'
const svgFrameSize = svgSize()
const mainSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
mainSVG.setAttribute('version', '1.1')
mainSVG.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
mainSVG.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
mainSVG.setAttribute('width', svgFrameSize.w)
mainSVG.setAttribute('height', svgFrameSize.h)
svgContainer.appendChild(mainSVG)
const windowFrame = document.getElementById('windowFrame')
windowFrame.appendChild(svgContainer)
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
windowFrame.appendChild(paramBox)

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
            // top and bootom
            if (
                y > 0 &&
                y < g.rows &&
                g.value[i - g.rows] &&
                g.value[i + g.rows]
            ) {
                fillCell(x, y, palette.colors[i % palette.colors.length])
                fillCell(x, y - 1, palette.colors[i % palette.colors.length])
                fillCell(x, y + 1, palette.colors[i % palette.colors.length])
            }
            // left & right
            if (
                x > 0 &&
                x < g.cols &&
                g.value[i + g.cols] &&
                g.value[i - g.cols]
            ) {
                fillCell(x, y, palette.colors[i % palette.colors.length])
                fillCell(x - 1, y, palette.colors[i % palette.colors.length])
                fillCell(x + 1, y, palette.colors[i % palette.colors.length])
            }
            if (x > 0 && y > 0 && g.value[i - 1] && g.value[i - g.cols]) {
                fillCell(x, y, palette.colors[i % palette.colors.length])
                bottomRightTriangle(
                    x - 1,
                    y - 1,
                    palette.colors[i % palette.colors.length]
                )
            }
            if (x < g.cols && y > 0 && g.value[i - 1] && g.value[i + g.cols]) {
                fillCell(x, y, palette.colors[i % palette.colors.length])
                bottomLeftTriangle(
                    x + 1,
                    y - 1,
                    palette.colors[i % palette.colors.length]
                )
            }
            if (
                x < g.cols &&
                y < g.rows &&
                g.value[i + 1] &&
                g.value[i + g.cols]
            ) {
                fillCell(x, y, palette.colors[i % palette.colors.length])
                topLeftTriangle(
                    x + 1,
                    y + 1,
                    palette.colors[i % palette.colors.length]
                )
            }
            if (x > 0 && y < g.rows && g.value[i + 1] && g.value[i - g.cols]) {
                fillCell(x, y, palette.colors[i % palette.colors.length])
                topRightTriangle(
                    x - 1,
                    y + 1,
                    palette.colors[i % palette.colors.length]
                )
            }
        }
    }
}

const sketch = {
    init: () => {
        g.init()
        sketch.changeColor()
        sketch.update()
        print()
    },
    update: () => {
        g.update()
        const aliveCellInGrid = g.value.reduce((stock, cell) => {
            return cell || stock ? true : false
        })
        if (!aliveCellInGrid) {
            sketch.init()
        }
        print()
    },
    changeColor: () => {
        palette = tome.get()
        print()
    },
    downloadSVG: () => {
        if (window.confirm('Do you want to download the SVG file ?')) {
            const date = new Date()
            const filename =
                'Cellular-Automata.' +
                date.getHours() +
                '.' +
                date.getMinutes() +
                '.' +
                date.getSeconds() +
                '--Nicolas_Lebrun.svg'

            exportSVG('frame', filename)
        }
    }
}

export default sketch
