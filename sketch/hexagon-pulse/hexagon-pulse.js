// Based on https://tixy.land/?code=sin%28t-sqrt%28%28x-7.5%29**2%2B%28y-6%29**2%29%29
import ease from '../../src/js/sketch-common/ease'

const sketch = (p5) => {
    const numFrame = 60
    let canvasSize, middle, numRow, step
    const sketchSize = () => {
        const side = Math.min(window.innerWidth, window.innerHeight)
        return side > 800 ? 800 : side * 0.85
    }
    p5.hexagon = (center, radius, angle, side, t) => {
        const _t = (t < 0.5 ? t : 1 - t) * 2
        for (let theta = 0; theta < Math.PI * 2; theta += Math.PI / side) {
            p5.beginShape()
            // p5.vertex(center.x, center.y)
            p5.vertex(
                center.x + radius * _t * Math.cos(theta),
                center.y + radius * _t * Math.sin(theta)
            )
            p5.vertex(
                center.x + radius * Math.cos(theta + angle),
                center.y + radius * Math.sin(theta + angle)
            )
            p5.endShape(p5.CLOSE)
            /*  p5.line(
                center.x + radius * t * Math.cos(theta - angle),
                center.y + radius * t * Math.sin(theta - angle),
                center.x + radius * Math.cos(theta + angle),
                center.y + radius * Math.sin(theta + angle)
            ) */
        }
    }
    p5.setup = () => {
        canvasSize = sketchSize()
        p5.createCanvas(canvasSize, canvasSize)
        step = canvasSize / 24
        numRow = canvasSize / step
        middle = canvasSize / (step * 2)
        p5.stroke(255)
        p5.fill(255)
        p5.strokeWeight(2)
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
                    (1 / 3.0)
                p5.hexagon(
                    p,
                    size,
                    Math.PI * 2 * t,
                    3,
                    t > 0.5 ? 0.5 + t : 1.5 - t
                )
            }
        }
    }
}

export default sketch
