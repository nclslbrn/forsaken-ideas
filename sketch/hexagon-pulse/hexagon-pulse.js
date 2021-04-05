// Based on https://tixy.land/?code=sin%28t-sqrt%28%28x-7.5%29**2%2B%28y-6%29**2%29%29
import ease from '../../src/js/sketch-common/ease'

const sketch = (p5) => {
    const numFrame = 60
    let canvasSize, middle, numRow, step
    const sketchSize = () => {
        const side = Math.min(window.innerWidth, window.innerHeight)
        return side > 800 ? 800 : side * 0.85
    }
    p5.hexagon = (center, radius, angle) => {
        p5.beginShape()
        for (let theta = 0; theta < Math.PI * 2; theta += Math.PI / 3) {
            p5.vertex(
                center.x + radius * Math.cos(theta + angle),
                center.y + radius * Math.sin(theta + angle)
            )
        }
        p5.endShape(p5.CLOSE)
    }
    p5.setup = () => {
        canvasSize = sketchSize()
        p5.createCanvas(canvasSize, canvasSize)
        step = canvasSize / 12
        numRow = canvasSize / step
        middle = canvasSize / (step * 2)
        p5.stroke(255)
        p5.fill(255)
        //p5.noStroke()
    }
    p5.draw = () => {
        p5.background(0)
        const t = (p5.frameCount % numFrame) / numFrame
        for (let x = 0; x <= p5.width / step; x++) {
            for (let y = 0; y <= p5.height / step; y++) {
                const j = Math.sin(
                    t * middle * 0.5 -
                        Math.sqrt((x - middle) ** 2 + (y - middle) ** 2)
                )
                const p = {
                    x: x * step,
                    y: (x % 2 == 0 ? y : y + 0.5) * step
                }
                const size = step * Math.abs(j) * 0.5 //* 1.15
                const rot =
                    ease(
                        ((p5.frameCount + x + y * numRow) % numFrame) /
                            numFrame,
                        5
                    ) *
                    Math.PI *
                    (1 / 3)
                p5.hexagon(p, size, rot)
            }
        }
    }
}

export default sketch
