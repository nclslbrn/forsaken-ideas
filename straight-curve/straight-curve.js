// Create a grid
const sketchWidth = 602
const sketchHeight = 720

const cells = 25
const regularSize = sketchWidth / cells
const cellSizeVariation = (regularSize / cells) * 3
let xIncrement, yIncrement, xIncrementStep, yIncrementStep, initStep, xIncrementFactor, yIncrementFactor
xIncrement = yIncrement = -cellSizeVariation

initStep = (cellSizeVariation / cells) * regularSize - 1
xIncrementFactor = 1.5
yIncrementFactor = .7
xIncrementStep = initStep * xIncrementFactor
yIncrementStep = initStep * yIncrementFactor

const trianglesPos = []
let cellWidth, cellHeight, xPos, yPos, totalTriangles
cellWidth = regularSize + xIncrement
cellHeight = regularSize + yIncrement
xPos = yPos = totalTriangles = 0

const sketch = (p5) => {

    p5.setup = () => {

        p5.createCanvas(sketchWidth, sketchHeight)
    }

    p5.init = () => {

        if (xPos < sketchWidth) {

            if (yPos < sketchHeight) {

                if (yIncrement > cellSizeVariation)
                    yIncrementStep--

                if (yIncrement < -cellSizeVariation)
                    yIncrementStep++

                yIncrement += yIncrementStep;

                cellHeight = regularSize + yIncrement;

                trianglesPos.push({
                    x: xPos,
                    y: yPos,
                    width: cellWidth,
                    height: cellHeight
                })

                yPos = yPos + cellHeight
                totalTriangles++

            } else { // end of column

                yIncrementStep = initStep * yIncrementFactor
                yIncrement = -cellSizeVariation
                yPos = 0

                if (xIncrement > cellSizeVariation)
                    xIncrementStep--

                if (xIncrement < -cellSizeVariation)
                    xIncrementStep++

                xIncrement += xIncrementStep
                cellWidth = regularSize + xIncrement
                xPos = xPos + cellWidth

            }

        } else {

            p5.noLoop();
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