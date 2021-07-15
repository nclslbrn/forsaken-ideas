import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import AutomataGrid from '../../src/js/sketch-common/AutomataGrid'
import MirrorShape from './MirrorShape'
import PlottingFunction from './PlottingFunction'
import { getRandomPalette } from '../../src/js/sketch-common/stabilo68-colors'
import Notification from '../../src/js/sketch-common/Notification'

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

const sketch = {
    svg: new SvgTracer(document.getElementById('windowFrame'), 'a3'),
    g: undefined,
    mirror: false,
    palette: false,
    cellSize: undefined,
    groupsByColor: [],
    plot: false,
    neededAliveNeighboors: 2,
    initPercentChanceAliveCell: 0.35,
    launch: () => {
        sketch.svg.init()
        sketch.init()
    },
    init: () => {
        sketch.g = new AutomataGrid(6, 6)
        sketch.cellSize = {
            w: sketch.svg.width / (1 + sketch.g.cols * 2),
            h: sketch.svg.height / (1 + sketch.g.rows * 2)
        }
        sketch.mirror = new MirrorShape(sketch.g.cols, sketch.g.rows)
        sketch.plot = new PlottingFunction(
            sketch.svg,
            sketch.mirror,
            sketch.cellSize
        )
        sketch.g.init(sketch.initPercentChanceAliveCell)
        sketch.changeColor()
        sketch.g.update(sketch.neededAliveNeighboors)
        sketch.fillSvg()
    },
    update: () => {
        sketch.g.update(sketch.neededAliveNeighboors)
        const aliveCellInGrid = sketch.g.value.reduce((stock, cell) => {
            return cell || stock ? true : false
        })
        if (!aliveCellInGrid) {
            new Notification(
                'All cells become dead, the grid has been reset.',
                sketch.svg.parentElem,
                'light'
            )
            sketch.g.init()
        }
        sketch.fillSvg()
    },
    fillSvg: () => {
        sketch.svg.clearGroups()
        for (let x = 0; x <= sketch.g.cols; x++) {
            for (let y = 0; y <= sketch.g.rows; y++) {
                const i = x * sketch.g.cols + y
                const colorNum = i % sketch.palette.length

                // top and bottom
                if (
                    y > 0 &&
                    y < sketch.g.rows &&
                    sketch.g.value[i - sketch.g.rows] &&
                    sketch.g.value[i + sketch.g.rows]
                ) {
                    sketch.plot.topLeftTriangle(
                        x,
                        y,
                        sketch.groupsByColor[colorNum]
                    )
                    sketch.plot.fillCell(x, y, sketch.groupsByColor[colorNum])
                }
                // left & right
                if (
                    x > 0 &&
                    x < sketch.g.cols &&
                    sketch.g.value[i + sketch.g.cols] &&
                    sketch.g.value[i - sketch.g.cols]
                ) {
                    sketch.plot.bottomRightTriangle(
                        x,
                        y,
                        sketch.groupsByColor[colorNum]
                    )
                    sketch.plot.fillCell(x, y, sketch.groupsByColor[colorNum])
                }
                // top & left
                if (
                    x > 0 &&
                    y > 0 &&
                    sketch.g.value[i - 1] &&
                    sketch.g.value[i - sketch.g.cols]
                ) {
                    sketch.plot.topLeftTriangle(
                        x - 1,
                        y - 1,
                        sketch.groupsByColor[colorNum]
                    )
                }
                // top & right
                if (
                    x < sketch.g.cols &&
                    y > 0 &&
                    sketch.g.value[i - 1] &&
                    sketch.g.value[i + sketch.g.cols]
                ) {
                    sketch.plot.topRightTriangle(
                        x + 1,
                        y - 1,
                        sketch.groupsByColor[colorNum]
                    )
                }
                // bottom & right
                if (
                    x < sketch.g.cols &&
                    y < sketch.g.rows &&
                    sketch.g.value[i + 1] &&
                    sketch.g.value[i + sketch.g.cols]
                ) {
                    sketch.plot.bottomRightTriangle(
                        x + 1,
                        y + 1,
                        sketch.groupsByColor[colorNum]
                    )
                }
                // bottom & left
                if (
                    x > 0 &&
                    y < sketch.g.rows &&
                    sketch.g.value[i + 1] &&
                    sketch.g.value[i - sketch.g.cols]
                ) {
                    sketch.plot.bottomLeftTriangle(
                        x - 1,
                        y + 1,
                        sketch.groupsByColor[colorNum]
                    )
                }
            }
        }
    },
    changeColor: () => {
        sketch.groupsByColor = []
        sketch.svg.clear()
        sketch.palette = getRandomPalette(4)
        sketch.palette.forEach((color) => {
            const groupName = color.name.replace(' ', '_').toLowerCase()
            sketch.svg.group({ name: groupName, fill: color.value })
            sketch.groupsByColor.push(groupName)
        })
        sketch.fillSvg()
    },
    downloadSVG: () => {
        if (window.confirm('Do you want to download the SVG file ?')) {
            sketch.svg.export({
                name: 'cells'
            })
        }
    }
}

export default sketch
