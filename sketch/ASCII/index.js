import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import p5 from 'p5'
import ease from '../../sketch-common/ease'

const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

let isPlaying, canvas
const numFrame = 60
const cellSize = 64

const sketch = (p5) => {
    const charStack = [...'abcdefghijklmopqrstuvwxyz']

    let f, cellByLine, chars0, chars1, margin
    const sketchSize = () => {
        const minSide = Math.min(window.innerWidth, window.innerHeight)
        return minSide * 0.85
    }
    const switchLine = () => {
        let switchChars = [...chars0]
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

            switchChars[cellIndex] = chars0[switchWith]
            switchChars[switchWith] = chars0[cellIndex]
        }
        return switchChars
    }
    p5.preload = () => {
        f = p5.loadFont('./assets/Inter-Bold.otf')
    }
    p5.setup = () => {
        const size = sketchSize()
        canvas = p5.createCanvas(size, size)
        cellByLine = {
            w: Math.round(size / cellSize) - 2,
            h: Math.round(size / cellSize) - 2
        }
        margin = {
            x: (size - (cellByLine.w + 1) * cellSize) / 2,
            y: (size - (cellByLine.h + 1) * cellSize) / 2
        }
        p5.textFont(f, cellSize)
        p5.textAlign(p5.CENTER)
        sketch.init_sketch()
        p5.fill('#333')
        p5.noStroke()
    }
    sketch.initChars = () => {
        chars0 = []
        for (let i = 0; i < cellByLine.w * cellByLine.h; i++) {
            chars0.push(p5.random(charStack))
        }
        chars1 = switchLine()
        isPlaying = true
    }
    sketch.init_sketch = () => {
        sketch.initChars()
    }

    sketch.capture = () => p5.saveCanvas(canvas, 'ASCII.jpg')

    p5.draw = () => {
        if (!isPlaying) {
            return
        }
        if (p5.frameCount % numFrame !== 0) {
            const t = (p5.frameCount % numFrame) / numFrame
            p5.background('#fefefe')
            for (let x = 0; x < cellByLine.w; x++) {
                for (let y = 0; y < cellByLine.h; y++) {
                    const cellIndex = x * cellByLine.h + y
                    const from = charStack.indexOf(chars0[cellIndex])
                    const to = charStack.indexOf(chars1[cellIndex])
                    const curr =
                        from === to
                            ? from
                            : Math.round(p5.map(ease(t), 0, 1, from, to))
                    p5.text(
                        charStack[curr].toUpperCase(),
                        margin.x + (x + 0.5) * cellSize,
                        margin.y + (y + 0.25) * cellSize,
                        cellSize,
                        cellSize
                    )
                }
            }
        } else {
            chars0 = chars1
            chars1 = switchLine()
        }
    }
    p5.moussePressed = () => {
        p5.saveCanvas()
    }
    p5.windowResized = () => {
        isPlaying = false
        const size = sketchSize()
        p5.resizeCanvas(size, size)
        cellByLine = {
            w: Math.round(size / cellSize) - 2,
            h: Math.round(size / cellSize) - 2
        }
        sketch.initChars()
    }
}

new p5(sketch, containerElement)
containerElement.removeChild(loader)

window.init = sketch.init_sketch
window.capture = sketch.capture
window.infobox = infobox
handleAction()
