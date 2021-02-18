import ease from '../../src/js/sketch-common/ease'

const numFrame = 15
const cellByLine = 8
const pointByCell = 6

const sketch = (p5) => {
    let cellSize, curves, nextCurves

    const switchLine = () => {
        let switchCurves = [...curves]

        const lineNum = p5.floor(p5.random() * cellByLine)
        const isVerticalLine = p5.random() > 0.5
        let switchNext = p5.random() > 0.5

        if (lineNum == 0) switchNext = true
        if (lineNum == cellByLine - 1) switchNext = false

        for (let i = 0; i < cellByLine; i++) {
            let cellIndex, switchWith
            if (isVerticalLine) {
                cellIndex = lineNum + i * cellByLine
                switchWith =
                    (switchNext ? lineNum + 1 : lineNum - 1) + i * cellByLine
            } else {
                cellIndex = lineNum * cellByLine + i
                switchWith =
                    (switchNext ? lineNum + 1 : lineNum - 1) * cellByLine + i
            }
            switchCurves[cellIndex] = curves[switchWith]
            switchCurves[switchWith] = curves[cellIndex]
        }
        return switchCurves
    }
    const sketchSize = () => {
        const side = p5.min(window.innerWidth, window.innerHeight)
        return {
            w: side > 800 ? 800 : side * 0.85,
            h: side > 800 ? 800 : side * 0.85
        }
    }
    p5.setup = () => {
        const size = sketchSize()
        p5.createCanvas(size.w, size.h)
        p5.stroke(230, 150)
        p5.strokeWeight(2)
        p5.noFill()
        sketch.init_sketch()
    }
    sketch.init_sketch = () => {
        curves = []
        cellSize = p5.min(
            p5.width / (cellByLine + 2),
            p5.height / (cellByLine + 2)
        )

        const radiusChoices = [1, 2, 3, 5, 8].map((factor) => {
            const side = p5.random() > 0.5 ? -1 : 1
            return cellSize / 2 + ((cellSize / 2) * side) / factor
        })
        for (let i = 0; i < p5.sq(cellByLine); i++) {
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
            p5.translate(cellSize, cellSize)
            p5.beginShape()
            for (let x = 0; x < cellByLine; x++) {
                for (let y = 0; y < cellByLine; y++) {
                    const _y = x % 2 == 0 ? cellByLine - y - 1 : y
                    const cellIndex = _y * cellByLine + x
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
}
export default sketch
