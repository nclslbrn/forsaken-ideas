import ease from '../../src/js/sketch-common/ease'

let canvas
const numFrame = 15
const cellSize = 48
const pointByCell = 6

const sketch = (p5) => {
    let cellByLine, curves, nextCurves

    const switchLine = () => {
        let switchCurves = [...curves]

        const colNum = p5.floor(p5.random() * cellByLine.w)
        const rowNum = p5.floor(p5.random() * cellByLine.h)

        const isVerticalLine = p5.random() > 0.5
        let switchNext = p5.random() > 0.5

        if (
            (colNum == 0 && isVerticalLine) ||
            (rowNum == 0 && !isVerticalLine)
        ) {
            switchNext = true
        }
        if (
            (colNum == cellByLine.w - 1 && isVerticalLine) ||
            (rowNum == cellByLine.h - 1 && !isVerticalLine)
        ) {
            switchNext = false
        }

        for (let i = 0; i < cellByLine[isVerticalLine ? 'h' : 'w']; i++) {
            let cellIndex, switchWith
            if (isVerticalLine) {
                cellIndex = colNum + i * cellByLine.w
                switchWith =
                    (switchNext ? colNum + 1 : colNum - 1) + i * cellByLine.w
            } else {
                cellIndex = rowNum * cellByLine.h + i
                switchWith =
                    (switchNext ? rowNum + 1 : rowNum - 1) * cellByLine.h + i
            }
            switchCurves[cellIndex] = curves[switchWith]
            switchCurves[switchWith] = curves[cellIndex]
        }
        return switchCurves
    }
    const sketchSize = () => {
        return {
            w: 1200, // window.innerWidth * 0.85,
            h: 630 // window.innerHeight * 0.85
        }
    }
    p5.setup = () => {
        const size = sketchSize()
        canvas = p5.createCanvas(size.w, size.h)
        p5.stroke(230, 150)
        p5.strokeWeight(2)
        p5.noFill()
        sketch.init_sketch()
    }

    sketch.init_sketch = () => {
        cellByLine = {
            w: Math.round(p5.width / cellSize),
            h: Math.round(p5.height / cellSize)
        }
        curves = []

        const radiusChoices = [1, 2, 3, 5, 8].map((factor) => {
            const side = p5.random() > 0.5 ? -1 : 1
            return cellSize / 2 + ((cellSize / 2) * side) / factor
        })
        for (let i = 0; i < cellByLine.w * cellByLine.h; i++) {
            const points = []
            for (let j = 0; j < pointByCell; j++) {
                const x =
                    radiusChoices[p5.floor(p5.random() * radiusChoices.length)]
                const y =
                    radiusChoices[p5.floor(p5.random() * radiusChoices.length)]
                points.push({ x: x, y: y })
            }
            curves.push(points)
        }
        nextCurves = switchLine()
    }
    p5.draw = () => {
        if (p5.frameCount % numFrame !== 0) {
            const t = (p5.frameCount % numFrame) / numFrame
            p5.background(0, 100)
            p5.push()
            p5.translate(cellSize.w, cellSize.h)
            p5.beginShape()
            for (let x = 0; x < cellByLine.w; x++) {
                for (let y = 0; y < cellByLine.h; y++) {
                    const _y = x % 2 == 0 ? cellByLine.h - y - 1 : y
                    const cellIndex = x * cellByLine.h + _y
                    for (let n = 0; n < pointByCell; n++) {
                        const cx = p5.lerp(
                            curves[cellIndex][n].x,
                            nextCurves[cellIndex][n].x,
                            ease(t)
                        )
                        const cy = p5.lerp(
                            curves[cellIndex][n].y,
                            nextCurves[cellIndex][n].y,
                            ease(t)
                        )
                        p5.curveVertex(x * cellSize + cx, _y * cellSize + cy)
                    }
                }
            }
            p5.endShape()
            p5.pop()
        } else {
            curves = nextCurves
            nextCurves = switchLine()
        }
    }

    p5.windowResized = () => {
        const size = sketchSize()
        p5.resizeCanvas(size.w, size.h)
        sketch.init_sketch()
    }

    p5.keyPressed = () => {
        p5.save(canvas, 'capture', 'jpg')
    }
}
export default sketch
