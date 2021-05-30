import AutomataGrid from '../../src/js/sketch-common/AutomataGrid'
import MirrorShape from './MirrorShape'
import exportSVG from '../../src/js/sketch-common/exportSVG'
import {
    getRandomPalette,
    getColorCombination
} from '../../src/js/sketch-common/stabilo68-colors'

let palette,
    cellSize,
    colorsGroups = []

const svgSize = () => {
    // optimized for landscape screen
    // Give it A0 aspect ratio
    return {
        w: window.innerHeight * 1.414,
        h: window.innerHeight
    }
}
const rect = (x = 0, y = 0, width = 0, height = 0, color) => {
    const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    r.setAttribute('x', x)
    r.setAttribute('y', y)
    r.setAttribute('width', width)
    r.setAttribute('height', height)
    colorsGroups[color].appendChild(r)
    //r.setAttribute('fill', color)
    //mainSVG.appendChild(r)
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
    //t.setAttribute('fill', color)
    //mainSVG.appendChild(t)
    colorsGroups[color].appendChild(t)
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

const print = () => {
    if (colorsGroups[0] !== undefined) {
        colorsGroups.forEach((g) => {
            g.childNodes.forEach((child) => {
                child.remove()
            })
        })
    }

    for (let x = 0; x <= g.cols; x++) {
        for (let y = 0; y <= g.rows; y++) {
            const i = x * g.cols + y
            const colorNum = i % palette.length
            // top and bootom
            if (
                y > 0 &&
                y < g.rows &&
                g.value[i - g.rows] &&
                g.value[i + g.rows]
            ) {
                fillCell(x, y, colorNum)
                fillCell(x, y - 1, colorNum)
                fillCell(x, y + 1, colorNum)
            }
            // left & right
            if (
                x > 0 &&
                x < g.cols &&
                g.value[i + g.cols] &&
                g.value[i - g.cols]
            ) {
                fillCell(x, y, colorNum)
                fillCell(x - 1, y, colorNum)
                fillCell(x + 1, y, colorNum)
            }
            if (x > 0 && y > 0 && g.value[i - 1] && g.value[i - g.cols]) {
                fillCell(x, y, colorNum)
                bottomRightTriangle(x - 1, y - 1, colorNum)
            }
            if (x < g.cols && y > 0 && g.value[i - 1] && g.value[i + g.cols]) {
                fillCell(x, y, colorNum)
                bottomLeftTriangle(x + 1, y - 1, colorNum)
            }
            if (
                x < g.cols &&
                y < g.rows &&
                g.value[i + 1] &&
                g.value[i + g.cols]
            ) {
                fillCell(x, y, i % palette.length)
                topLeftTriangle(x + 1, y + 1, colorNum)
            }
            if (x > 0 && y < g.rows && g.value[i + 1] && g.value[i - g.cols]) {
                fillCell(x, y, i % palette.length)
                topRightTriangle(x - 1, y + 1, colorNum)
            }
        }
    }
}

// Create container
const svgContainer = document.createElement('div')
svgContainer.id = 'frame'
svgContainer.setAttribute(
    'style',
    'height: 90vh; width: auto; padding: 0; background: #fff;'
)

const svgFrameSize = svgSize()
const mainSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
mainSVG.setAttribute('version', '1.1')
mainSVG.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
mainSVG.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
mainSVG.setAttribute('width', svgFrameSize.w)
mainSVG.setAttribute('height', svgFrameSize.h)
mainSVG.setAttribute('viewBox', `0 0 ${svgFrameSize.w} ${svgFrameSize.h}`)
mainSVG.setAttribute('style', 'height: 90%; width: auto; padding: 60px;')
svgContainer.appendChild(mainSVG)
const windowFrame = document.getElementById('windowFrame')
windowFrame.appendChild(svgContainer)

// Setup automata
const g = new AutomataGrid(12, 8)
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
        print()
    },
    false
)
windowFrame.appendChild(paramBox)

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
            g.init()
        }
        print()
    },
    changeColor: () => {
        palette = getRandomPalette(3)
        // palette = getColorCombination(false, 'Mondrian').colors

        mainSVG
            .querySelectorAll('g')
            .forEach((group) => mainSVG.removeChild(group))
        colorsGroups = []

        // create group for every color in palette
        palette.forEach((color) => {
            const group = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'g'
            )
            group.setAttribute('fill', color.value)
            group.setAttribute('id', color.name.replace(' ', '_').toLowerCase())
            mainSVG.appendChild(group)
            colorsGroups.push(group)
        })
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
