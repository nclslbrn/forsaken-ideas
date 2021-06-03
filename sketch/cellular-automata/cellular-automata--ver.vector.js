import AutomataGrid from '../../src/js/sketch-common/AutomataGrid'
import exportSVG from '../../src/js/sketch-common/exportSVG'
import {
    getRandomPalette,
    getColorCombination
} from '../../src/js/sketch-common/stabilo68-colors'
import MirrorShape from './MirrorShape'

const svgSize = () => {
    // optimized for landscape screen
    // Give it A0 aspect ratio
    return {
        w: 1122,
        h: 793
    }
}
const rect = (x = 0, y = 0, width = 0, height = 0, color) => {
    const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    r.setAttribute('x', x)
    r.setAttribute('y', y)
    r.setAttribute('width', width)
    r.setAttribute('height', height)
    sketch.groupsByColor[color].appendChild(r)
}
const triangle = (p = [], color) => {
    const _x = (v) => {
        return v * sketch.cellSize.w
    }
    const _y = (v) => {
        return v * sketch.cellSize.h
    }
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    t.setAttribute(
        'd',
        `M ${_x(p[0])},${_y(p[1])}L ${_x(p[2])},${_y(p[3])}L ${_x(p[4])},${_y(
            p[5]
        )}Z`
    )
    sketch.groupsByColor[color].appendChild(t)
}
const fillCell = (x, y, color) => {
    mirror.allCorners(x, y).forEach((p) => {
        rect(
            p[0] * sketch.cellSize.w,
            p[1] * sketch.cellSize.h,
            sketch.cellSize.w,
            sketch.cellSize.h,
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
svgContainer.setAttribute(
    'style',
    'height: 85vh; width: auto; padding: 5vh; background: #fff;'
)

const svgFrameSize = svgSize()
const mainSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
mainSVG.setAttribute('version', '1.1')
mainSVG.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
mainSVG.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
mainSVG.setAttribute('width', svgFrameSize.w)
mainSVG.setAttribute('height', svgFrameSize.h)
mainSVG.setAttribute('viewBox', `0 0 ${svgFrameSize.w} ${svgFrameSize.h}`)
mainSVG.setAttribute('style', 'height: 85vh; width: auto;')
svgContainer.appendChild(mainSVG)
const windowFrame = document.getElementById('windowFrame')
windowFrame.appendChild(svgContainer)

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
        sketch.fillSvg()
    },
    false
)
windowFrame.appendChild(paramBox)
const g = new AutomataGrid(24, 24)
const mirror = new MirrorShape(g.cols, g.rows)

const sketch = {
    palette: false,
    cellSize: {
        w: svgFrameSize.w / (1 + g.cols * 2),
        h: svgFrameSize.h / (1 + g.rows * 2)
    },
    groupsByColor: [],
    init: () => {
        g.init()
        sketch.changeColor()
        sketch.update()
        sketch.fillSvg()
    },
    update: () => {
        g.update()
        const aliveCellInGrid = g.value.reduce((stock, cell) => {
            return cell || stock ? true : false
        })
        if (!aliveCellInGrid) {
            g.init()
        }
        sketch.fillSvg()
    },
    emptySvg: () => {
        for (let i = 0; i < sketch.groupsByColor.length; i++) {
            while (sketch.groupsByColor[i].firstChild) {
                sketch.groupsByColor[i].removeChild(
                    sketch.groupsByColor[i].firstChild
                )
            }
        }
    },
    fillSvg: () => {
        sketch.emptySvg()
        for (let x = 0; x <= g.cols; x++) {
            for (let y = 0; y <= g.rows; y++) {
                const i = x * g.cols + y
                const colorNum = i % sketch.palette.length

                // top and bootom
                if (
                    y > 0 &&
                    y < g.rows &&
                    g.value[i - g.rows] &&
                    g.value[i + g.rows]
                ) {
                    topLeftTriangle(x, y, colorNum)
                    //fillCell(x, y, colorNum)
                    //fillCell(x, y - 1, colorNum)
                    //fillCell(x, y + 1, colorNum)
                }
                // left & right
                if (
                    x > 0 &&
                    x < g.cols &&
                    g.value[i + g.cols] &&
                    g.value[i - g.cols]
                ) {
                    bottomRightTriangle(x, y, colorNum)
                    //fillCell(x, y, colorNum)
                    //fillCell(x - 1, y, colorNum)
                    //fillCell(x + 1, y, colorNum)
                }
                // top & left
                if (x > 0 && y > 0 && g.value[i - 1] && g.value[i - g.cols]) {
                    //fillCell(x, y, colorNum)
                    topLeftTriangle(x - 1, y - 1, colorNum)
                }
                // top & right
                if (
                    x < g.cols &&
                    y > 0 &&
                    g.value[i - 1] &&
                    g.value[i + g.cols]
                ) {
                    //fillCell(x, y, colorNum)
                    topRightTriangle(x + 1, y - 1, colorNum)
                }
                // bottom & right
                if (
                    x < g.cols &&
                    y < g.rows &&
                    g.value[i + 1] &&
                    g.value[i + g.cols]
                ) {
                    //fillCell(x, y, i % sketch.palette.length)
                    bottomRightTriangle(x + 1, y + 1, colorNum)
                }
                // bottom & left
                if (
                    x > 0 &&
                    y < g.rows &&
                    g.value[i + 1] &&
                    g.value[i - g.cols]
                ) {
                    //fillCell(x, y, i % sketch.palette.length)
                    bottomLeftTriangle(x - 1, y + 1, colorNum)
                }
            }
        }
    },
    changeColor: () => {
        sketch.groupsByColor = []
        while (mainSVG.firstChild) {
            mainSVG.removeChild(mainSVG.firstChild)
        }
        sketch.palette = getRandomPalette(4)
        // sketch.palette = getColorCombination(3, false).colors
        // create group for every color in sketch.palette

        sketch.palette.forEach((color) => {
            const g = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'g'
            )
            g.setAttribute('id', color.name.replace(' ', '_').toLowerCase())
            g.setAttribute('fill', color.value)
            sketch.groupsByColor.push(g)
            mainSVG.appendChild(g)
        })
        sketch.fillSvg()
    },
    downloadSVG: () => {
        if (window.confirm('Do you want to download the SVG file ?')) {
            const date = new Date(),
                Y = date.getFullYear(),
                m = date.getMonth(),
                d = date.getDay(),
                H = date.getHours(),
                i = date.getMinutes(),
                filename = `Cells.${Y}-${m}-${d}.${H}-${i}.svg`

            exportSVG('frame', filename)
        }
    }
}

export default sketch
