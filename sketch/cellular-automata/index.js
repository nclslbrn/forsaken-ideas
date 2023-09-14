import '../framed-canvas.css'
import '../framed-two-columns.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import SvgTracer from '../../sketch-common/svg-tracer'
import AutomataGrid from '../../sketch-common/AutomataGrid'
import MirrorShape from './MirrorShape'
import PlottingFunction from './PlottingFunction'
import { getRandomPalette } from '../../sketch-common/stabilo68-colors'
import Notification from '../../sketch-common/Notification'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

const sketch = {
  svg: new SvgTracer({
    parentElem: document.getElementById('windowFrame'),
    size: 'A4_portrait',
    dpi: 150
  }),
  g: undefined,
  mirror: false,
  palette: false,
  cellSize: undefined,
  groupsByColor: [],
  plot: false,
  neededAliveNeighboors: 3,
  initPercentChanceAliveCell: 0.5,
  launch: () => {
    sketch.svg.init()
    sketch.init()
  },
  init: () => {
    sketch.g = new AutomataGrid(8, 12)
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
        'All cells died, the grid has been reinitialized.',
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

const paramBox = document.createElement('div')
paramBox.id = 'interactiveParameter'

const updateButton = document.createElement('button')
updateButton.innerText = '▶ Update the grid'
paramBox.appendChild(updateButton)
updateButton.addEventListener(
  'click',
  () => {
    sketch.update()
  },
  false
)
const colorButton = document.createElement('button')
colorButton.innerText = '🔄 Change color'
paramBox.appendChild(colorButton)
colorButton.addEventListener(
  'click',
  () => {
    sketch.changeColor()
    sketch.fillSvg()
  },
  false
)

sketch.launch()
windowFrame.removeChild(loader)
window.init = sketch.init
window.infobox = infobox
window.downloadSVG = sketch.downloadSVG
windowFrame.appendChild(paramBox)
handleAction()
