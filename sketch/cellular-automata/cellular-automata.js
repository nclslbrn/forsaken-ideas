import AutomataGrid from '../../src/js/sketch-common/AutomataGrid'
const cols = 10
const rows = 10
const sketchSize = () => {
    const side = Math.min(window.innerWidth, window.innerHeight)
    return {
        w: side > 800 ? 800 : side * 0.85,
        h: side > 800 ? 800 : side * 0.85
    }
}
const sketch = (p5) => {
    const mataGrid = new AutomataGrid(cols, rows)
    const canvasSize = sketchSize()

    const cellSize = {
        w: canvasSize.w / (cols * 2),
        h: canvasSize.h / (rows * 2)
    }

    const drawCell = (x, y, w, h) => {
        p5.rect(x * w, y * h, w, h)
    }

    p5.setup = () => {
        p5.createCanvas(canvasSize.w, canvasSize.h)
        mataGrid.init()
        mataGrid.update()
    }

    p5.draw = () => {
        p5.background(255)
        for (let x = 0; x <= cols; x++) {
            for (let y = 0; y <= rows; y++) {
                const i = y * cols + x
                if (mataGrid.value[i]) {
                    // top left
                    drawCell(x, y, cellSize.w, cellSize.h)
                    // top right
                    drawCell(cols + cols - x, y, cellSize.w, cellSize.h)
                    // bottom left
                    drawCell(x, rows + rows - y, cellSize.w, cellSize.h)
                    // bottom right
                    drawCell(
                        cols + cols - x,
                        rows + rows - y,
                        cellSize.w,
                        cellSize.h
                    )
                }
            }
        }
    }

    p5.mousePressed = () => {
        mataGrid.update()
        const aliveCellInGrid = mataGrid.value.reduce((stock, cell) => {
            return cell || stock ? true : false
        })
        if (!aliveCellInGrid) {
            console.log(
                'All cells are dead. Press mouse button to reinit the grid.'
            )
        }
    }

    p5.windowResized = () => {
        p5.resizeCanvas(window.innerWidth, window.innerHeight)
    }
}
export default sketch
