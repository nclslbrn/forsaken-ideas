import AutomataGrid from '../../src/js/sketch-common/AutomataGrid'
import MirrorShape from './MirrorShape'
import * as tome from 'chromotome'

const sketchSize = () => {
    const side = Math.min(window.innerWidth, window.innerHeight)
    return {
        w: side > 800 ? 800 : side * 0.85,
        h: side > 800 ? 800 : side * 0.85
    }
}
let canvas

const sketch = (p5) => {
    const g = new AutomataGrid(5, 5)
    const mirror = new MirrorShape(g.cols, g.rows)
    let canvasSize, cellSize, palette, colors
    canvasSize = sketchSize()
    cellSize = {
        w: canvasSize.w / (1 + g.cols * 2),
        h: canvasSize.h / (1 + g.rows * 2)
    }
    const fillCell = (x, y, color) => {
        p5.fill(color)
        mirror.allCorners(x, y).forEach((p) => {
            p5.rect(
                p[0] * cellSize.w,
                p[1] * cellSize.h,
                cellSize.w,
                cellSize.h
            )
        })
    }

    const topLeftTriangle = (x, y, color) => {
        p5.fill(color)
        mirror.topLeftCorner(x, y).forEach((p) => {
            p5.triangle(
                p[0] * cellSize.w,
                p[1] * cellSize.h,
                p[2] * cellSize.w,
                p[3] * cellSize.h,
                p[4] * cellSize.w,
                p[5] * cellSize.h
            )
        })
    }

    const topRightTriangle = (x, y, color) => {
        p5.fill(color)
        mirror.topRightCorner(x, y).forEach((p) => {
            p5.triangle(
                p[0] * cellSize.w,
                p[1] * cellSize.h,
                p[2] * cellSize.w,
                p[3] * cellSize.h,
                p[4] * cellSize.w,
                p[5] * cellSize.h
            )
        })
    }

    const bottomRightTriangle = (x, y, color) => {
        p5.fill(color)
        mirror.bottomRightCorner(x, y).forEach((p) => {
            p5.triangle(
                p[0] * cellSize.w,
                p[1] * cellSize.h,
                p[2] * cellSize.w,
                p[3] * cellSize.h,
                p[4] * cellSize.w,
                p[5] * cellSize.h
            )
        })
    }

    const bottomLeftTriangle = (x, y, color) => {
        p5.fill(color)
        mirror.bottomLeftCorner(x, y).forEach((p) => {
            p5.triangle(
                p[0] * cellSize.w,
                p[1] * cellSize.h,
                p[2] * cellSize.w,
                p[3] * cellSize.h,
                p[4] * cellSize.w,
                p[5] * cellSize.h
            )
        })
    }

    sketch.init = () => {
        palette = tome.get()
        colors = palette.colors.map((c) => p5.color(c))
        g.init()
        g.update()
    }

    p5.setup = () => {
        canvas = p5.createCanvas(canvasSize.w, canvasSize.h)

        const updateButton = document.createElement('button')
        updateButton.innerText = 'Update the grid'
        document.body.appendChild(updateButton)
        updateButton.addEventListener(
            'click',
            (event) => {
                sketch.update()
            },
            false
        )
        p5.noStroke()
        sketch.init()
    }

    p5.draw = () => {
        p5.background(p5.color(palette.background || palette.stroke || 100))
        for (let x = 0; x <= g.cols; x++) {
            for (let y = 0; y <= g.rows; y++) {
                const i = x * g.cols + y

                //if (g.value[i]) {
                // top & bottom
                if (g.value[i - g.rows] && g.value[i + g.rows]) {
                    fillCell(x, y, colors[i % colors.length])
                    fillCell(x, y - 1, colors[i % colors.length])
                    fillCell(x, y + 1, colors[i % colors.length])
                }
                // left & right
                if (g.value[i + g.cols] && g.value[i - g.cols]) {
                    fillCell(x, y, colors[i % colors.length])
                    fillCell(x - 1, y, colors[i % colors.length])
                    fillCell(x + 1, y, colors[i % colors.length])
                }
                if (g.value[i - 1] && g.value[i - g.cols]) {
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
                }
                //}
            }
        }
    }

    sketch.update = () => {
        g.update()
        const aliveCellInGrid = g.value.reduce((stock, cell) => {
            return cell || stock ? true : false
        })
        if (!aliveCellInGrid) {
            sketch.init()
        }
    }

    p5.windowResized = () => {
        canvasSize = sketchSize()
        cellSize = {
            w: canvasSize.w / (1 + g.cols * 2),
            h: canvasSize.h / (1 + g.rows * 2)
        }
        p5.resizeCanvas(canvasSize.w, canvasSize.h)
    }

    sketch.download_PNG = () => {
        /* const date = new Date()
        const filename =
            'Cellular-Automata.' +
            date.getHours() +
            '.' +
            date.getMinutes() +
            '.' +
            date.getSeconds() +
            '--copyright_Nicolas_Lebrun_CC-by-3.0'
        p5.save(canvas, filename, 'png') */
    }
}
export default sketch
