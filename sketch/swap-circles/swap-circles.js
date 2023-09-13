import ease from '../../sketch-common/ease'
import * as tome from 'chromotome'

let isPlaying
const numFrame = 15
const cellSize = 32

const sketch = (p5) => {
    let cellByLine, palette, radii, nextRadii, colors, nextColors
    const sketchSize = () => {
        const minSide = Math.min(window.innerWidth, window.innerHeight)
        return minSide * 0.85
    }
    const switchLine = () => {
        let switchRadii = [...radii]
        let switchColors = [...colors]

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
                cellIndex = colNum + cellByLine.w * i
                switchWith =
                    (switchNext ? colNum + 1 : colNum - 1) + cellByLine.w * i
            } else {
                cellIndex = rowNum * cellByLine.h + i
                switchWith =
                    (switchNext ? rowNum + 1 : rowNum - 1) * cellByLine.h + i
            }

            switchRadii[cellIndex] = radii[switchWith]
            switchRadii[switchWith] = radii[cellIndex]
            switchColors[cellIndex] = colors[switchWith]
            switchColors[switchWith] = colors[cellIndex]
        }
        return [switchRadii, switchColors]
    }
    p5.setup = () => {
        const size = sketchSize()
        p5.createCanvas(size, size)
        cellByLine = {
            w: Math.round(size / cellSize) - 2,
            h: Math.round(size / cellSize) - 2
        }
        sketch.init_sketch()
        p5.noStroke()
    }
    sketch.initCircle = () => {
        radii = []
        colors = []

        const radiusChoices = [1, 2, 3, 5, 8, 13, 21].map((factor) => {
            return cellSize / factor
        })
        for (let i = 0; i < cellByLine.w * cellByLine.h; i++) {
            radii.push(
                radiusChoices[Math.floor(Math.random() * radiusChoices.length)]
            )
            colors.push(
                palette.colors[
                    Math.floor(Math.random() * palette.colors.length)
                ]
            )
        }
        ;[nextRadii, nextColors] = switchLine()
        isPlaying = true
    }
    sketch.init_sketch = () => {
        palette = tome.get()
        sketch.initCircle()
    }
    p5.draw = () => {
        if (!isPlaying) {
            return
        }
        if (p5.frameCount % numFrame !== 0) {
            const t = (p5.frameCount % numFrame) / numFrame
            p5.background(palette.background || palette.stroke || '248')
            p5.push()
            p5.translate(cellSize / 2, cellSize / 2)

            for (let x = 0; x < cellByLine.w; x++) {
                for (let y = 0; y < cellByLine.h; y++) {
                    const cellIndex = x * cellByLine.h + y

                    const cellColor = p5.lerpColor(
                        p5.color(colors[cellIndex]),
                        p5.color(nextColors[cellIndex]),
                        ease(t)
                    )
                    const cellRadius = p5.lerp(
                        radii[cellIndex],
                        nextRadii[cellIndex],
                        ease(t)
                    )
                    p5.fill(cellColor)
                    p5.ellipse(
                        (1 + x) * cellSize,
                        (1 + y) * cellSize,
                        cellRadius
                    )
                }
            }
            p5.pop()
        } else {
            radii = nextRadii
            colors = nextColors
            ;[nextRadii, nextColors] = switchLine()
        }
    }

    p5.windowResized = () => {
        isPlaying = false
        const size = sketchSize()
        p5.resizeCanvas(size, size)
        cellByLine = {
            w: Math.round(size / cellSize) - 2,
            h: Math.round(size / cellSize) - 2
        }
        sketch.initCircle()
    }
}
export default sketch
