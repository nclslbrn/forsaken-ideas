// Create a grid
const sketchWidth = 600
const sketchHeight = 720
const cells = 24

const sketch = (p5) => {
    const sketchSize = (sketchWidth, sketchHeight) => {
        const ratio = sketchWidth / sketchHeight
        const side = p5.min(window.innerWidth, window.innerHeight)
        return {
            w: side > 800 ? sketchWidth : side * ratio,
            h: side > 800 ? sketchHeight : side
        }
    }
    const size = sketchSize(sketchWidth, sketchHeight)
    const regularSize = size.w / cells
    const cellSizeVariation = (regularSize / cells) * 3
    let xIncrement,
        yIncrement,
        xIncrementStep,
        yIncrementStep,
        initStep,
        xIncrementFactor,
        yIncrementFactor
    xIncrement = yIncrement = -cellSizeVariation

    initStep = (cellSizeVariation / cells) * regularSize - 1
    xIncrementFactor = 1.5
    yIncrementFactor = 0.7
    xIncrementStep = initStep * xIncrementFactor
    yIncrementStep = initStep * yIncrementFactor

    const trianglesPos = []
    let cellWidth, cellHeight, xPos, yPos
    cellWidth = regularSize + xIncrement
    cellHeight = regularSize + yIncrement
    xPos = yPos = 0

    p5.setup = function () {
        const canvas = p5.createCanvas(size.w, size.h)
        canvas.elt.style.aspectRatio = `${size.w} / ${size.h}`
    }

    p5.init = function () {
        if (xPos < size.w) {
            if (yPos < size.h) {
                if (yIncrement > cellSizeVariation) yIncrementStep--

                if (yIncrement < -cellSizeVariation) yIncrementStep++

                yIncrement += yIncrementStep

                cellHeight = regularSize + yIncrement

                trianglesPos.push({
                    x: xPos,
                    y: yPos,
                    width: cellWidth,
                    height: cellHeight
                })

                yPos = yPos + cellHeight
            } else {
                // end of column

                yIncrementStep = initStep * yIncrementFactor
                yIncrement = -cellSizeVariation
                yPos = 0

                if (xIncrement > cellSizeVariation) xIncrementStep--

                if (xIncrement < -cellSizeVariation) xIncrementStep++

                xIncrement += xIncrementStep
                cellWidth = regularSize + xIncrement
                xPos = xPos + cellWidth
            }
        } else {
            p5.noLoop()
        }
    }

    p5.draw = () => {
        p5.background(255)
        p5.fill(0)
        p5.init()

        for (var n = 0; n < trianglesPos.length; n++) {
            p5.triangle(
                trianglesPos[n].x,
                trianglesPos[n].y,

                trianglesPos[n].x + trianglesPos[n].width,
                trianglesPos[n].y + trianglesPos[n].height,

                trianglesPos[n].x,
                trianglesPos[n].y + trianglesPos[n].height
            )
        }
    }
}
export default sketch
