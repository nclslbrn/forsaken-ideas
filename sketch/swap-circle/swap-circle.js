import ease from '../../src/js/sketch-common/ease'
import * as tome from 'chromotome'

const numFrame = 15
const cellByLine = 16

const sketch = (p5) => {
    let cellSize, palette, radii, nextRadii, colors, nextColors
    const sketchSize = () => {
        const side = p5.min(window.innerWidth, window.innerHeight)
        return {
            w: side > 800 ? 800 : side * 0.85,
            h: side > 800 ? 800 : side * 0.85
        }
    }
    const switchLine = () => {
        let switchRadii = [...radii]
        let switchColors = [...colors]

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
            switchRadii[cellIndex] = radii[switchWith]
            switchRadii[switchWith] = radii[cellIndex]
            switchColors[cellIndex] = colors[switchWith]
            switchColors[switchWith] = colors[cellIndex]
        }
        return [switchRadii, switchColors]
    }
    p5.setup = () => {
        const size = sketchSize()
        p5.createCanvas(size.w, size.h)
        p5.noStroke()
        sketch.init_sketch()
    }
    sketch.init_sketch = () => {
        radii = []
        colors = []

        palette = tome.get()
        cellSize = p5.min(p5.width / cellByLine, p5.height / cellByLine)

        const radiusChoices = [1, 2, 3, 5, 8, 13, 21].map((factor) => {
            return cellSize / factor
        })
        for (let i = 0; i < p5.sq(cellByLine); i++) {
            radii.push(
                radiusChoices[p5.floor(p5.random() * radiusChoices.length)]
            )
            colors.push(
                palette.colors[p5.floor(p5.random() * palette.colors.length)]
            )
        }
        ;[nextRadii, nextColors] = switchLine()
    }
    p5.draw = () => {
        if (p5.frameCount % numFrame !== 0) {
            const t = (p5.frameCount % numFrame) / numFrame
            p5.background(palette.background || palette.stroke || '248')
            p5.push()
            p5.translate(cellSize / 2, cellSize / 2)
            for (let x = 0; x < cellByLine; x++) {
                for (let y = 0; y < cellByLine; y++) {
                    const cellIndex = y * cellByLine + x
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
                    p5.ellipse(x * cellSize, y * cellSize, cellRadius)
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
        const size = sketchSize()
        p5.resizeCanvas(size.w, size.h)
        sketch.init_sketch()
    }
}
export default sketch
