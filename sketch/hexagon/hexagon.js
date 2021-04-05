// Based on https://tixy.land/?code=sin%28t-sqrt%28%28x-7.5%29**2%2B%28y-6%29**2%29%29

const sketch = (p5) => {
    const numFrame = 400
    let canvasSize, middle, numRow, step
    const sketchSize = () => {
        const side = Math.min(window.innerWidth, window.innerHeight)
        return side > 800 ? 800 : side * 0.85
    }
    const hexa = (center, radius) => {
        p5.beginShape()
        for (let theta = 0; theta < Math.PI * 2; theta += Math.PI / 3) {
            p5.vertex(
                center.x + radius * Math.cos(theta),
                center.y + radius * Math.sin(theta)
            )
        }
        p5.endShape(p5.CLOSE)
    }
    p5.setup = () => {
        canvasSize = sketchSize()
        p5.createCanvas(canvasSize, canvasSize)
        p5.fill(0)
        step = canvasSize / 25
        numRow = canvasSize / step
        middle = canvasSize / (step * 2)
    }
    p5.draw = () => {
        p5.background(255)
        const t = (p5.frameCount % numFrame) / numFrame
        for (let x = 0; x <= p5.width / step; x++) {
            for (let y = 0; y <= p5.height / step; y++) {
                hexa(
                    { x: x * step, y: y * step },
                    step *
                        0.5 *
                        Math.sin(
                            t * middle -
                                Math.sqrt(
                                    (x - middle) ** 2 + (y - (middle - 1)) ** 2
                                )
                        )
                )
            }
        }
    }
}

export default sketch
