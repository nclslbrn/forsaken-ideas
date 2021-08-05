import ease from '../../src/js/sketch-common/ease'
import switchMode from './switchMode'
let canvas
const numFrame = 45
const cellSize = 48
const pointByCell = 8

window.drawAsSingleLine = switchMode()

const sketch = (p5) => {
    let cellByLine, curves, nextCurves, d

    const switchLine = () => {
        // Deep copy of current curves
        let switchCurves = [...curves]
        // Choose two random index to decide which col|row will swap with another
        const colNum = p5.floor(p5.random() * cellByLine.w)
        const rowNum = p5.floor(p5.random() * cellByLine.h)
        // Choose if we switch row or col
        const isVerticalSwitch = p5.random() > 0.5
        // Decide if we switch curve with previous row|col or next one
        let switchNext = p5.random() > 0.5
        // Prevent out of range col|row
        if (
            (colNum === 0 && isVerticalSwitch) ||
            (rowNum === 0 && !isVerticalSwitch)
        ) {
            switchNext = true
        }
        if (
            (colNum === cellByLine.w - 1 && isVerticalSwitch) ||
            (rowNum === cellByLine.h - 1 && !isVerticalSwitch)
        ) {
            switchNext = false
        }
        // Assign changes on swithcurves i could be x or y
        for (let i = 0; i < cellByLine[isVerticalSwitch ? 'h' : 'w']; i++) {
            // Cell index for curves and switchcurves
            let cellIndex, switchWith
            // const cellIndex = x * cellByLine.h + y
            if (isVerticalSwitch) {
                const swithCol = switchNext ? colNum + 1 : colNum - 1
                cellIndex = colNum * cellByLine.h + i
                switchWith = swithCol * cellByLine.h + i
            } else {
                const switchRow = switchNext ? rowNum + 1 : rowNum - 1
                cellIndex = i * cellByLine.h + rowNum
                switchWith = i * cellByLine.h + switchRow
            }
            switchCurves[cellIndex] = curves[switchWith]
            switchCurves[switchWith] = curves[cellIndex]
        }
        return switchCurves
    }
    const sketchSize = () => {
        return {
            w: window.innerWidth * 0.7,
            h: window.innerHeight * 0.7
        }
    }
    p5.setup = () => {
        const size = sketchSize()
        canvas = p5.createCanvas(size.w, size.h)
        p5.stroke(230, 230)
        //p5.strokeWeight(2)
        p5.noFill()
        sketch.init_sketch()
    }

    sketch.init_sketch = () => {
        cellByLine = {
            w: Math.round(p5.width / cellSize) - 2,
            h: Math.round(p5.height / cellSize) - 2
        }
        d = {
            x: (p5.width % cellByLine.w) / 2,
            y: (p5.height % cellByLine.h) / 2
        }
        curves = []
        nextCurves = []

        const radiusChoices = [2, 3, 5, 8].map((factor) => {
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
            p5.background(15)
            if (window.drawAsSingleLine) p5.beginShape()

            for (let x = 0; x < cellByLine.w; x++) {
                for (let y = 0; y < cellByLine.h; y++) {
                    // Make _y decrease if x even or increase if odd
                    const _y = x % 2 == 0 ? cellByLine.h - y - 1 : y
                    const cellIndex = x * cellByLine.h + _y

                    if (!window.drawAsSingleLine) p5.beginShape()
                    for (let n = 0; n < pointByCell; n++) {
                        const cx = p5.lerp(
                            curves[cellIndex][n].x,
                            nextCurves[cellIndex][n].x,
                            ease(t, 10)
                        )
                        const cy = p5.lerp(
                            curves[cellIndex][n].y,
                            nextCurves[cellIndex][n].y,
                            ease(t, 10)
                        )
                        const centerCell = {
                            x: (1 + x) * cellSize + d.x,
                            y: (1 + _y) * cellSize + d.y
                        }
                        p5.curveVertex(centerCell.x + cx, centerCell.y + cy)
                    }
                    if (!window.drawAsSingleLine) p5.endShape()

                    p5.push()
                    p5.stroke(0)
                    p5.rect(
                        (x + 1) * cellSize + d.x,
                        (y + 1) * cellSize + d.y,
                        cellSize,
                        cellSize
                    )
                    p5.pop()
                }
            }
            if (window.drawAsSingleLine) p5.endShape()
        } else {
            curves = nextCurves
            nextCurves = switchLine()
        }
    }

    p5.keyPressed = () => {
        // p or P
        if (p5.keyCode === 80 || p5.keyCode == 16) {
            p5.save(canvas, 'capture', 'jpg')
        }
    }
}
export default sketch
