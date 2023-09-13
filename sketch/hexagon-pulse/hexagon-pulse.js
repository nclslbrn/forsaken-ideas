// Based on https://tixy.land/?code=sin%28t-sqrt%28%28x-7.5%29**2%2B%28y-6%29**2%29%29


const sketch = (p5) => {
    const canvasSize = 1200,
        step = canvasSize / 48,
        middle = canvasSize / (step * 2),
        numFrame = 500

    p5.hexagon = (center, radius, t) => {
        const side = p5.map(t < 0.5 ? t : 1 - t, 0, 0.5, 2, 5.0)
        p5.beginShape()
        for (let theta = 0; theta < Math.PI * 2; theta += Math.PI / side) {
            const r = theta //+ Math.PI * t
            p5.vertex(
                center.x + radius * Math.cos(r),
                center.y + radius * Math.sin(r)
            )
        }
        p5.endShape(p5.CLOSE)
    }
    
    p5.setup = function() {
        p5.createCanvas(canvasSize, canvasSize)
        p5.stroke(255)
        p5.fill(0)
        p5.strokeWeight(4)
    }

    p5.draw = function() {
        p5.background(0)
        const t = (p5.frameCount % numFrame) / numFrame
        for (let x = 0; x <= p5.width / step; x++) {
            for (let y = 0; y <= p5.height / step; y++) {
                const i =
                    t* 3 * middle -
                    Math.hypot(x-middle, y- middle)
                    //Math.sqrt((x - middle) ** 2 + (y - middle) ** 2)
                const j = Math.sin(i)
                const p = {
                    x: x * step,
                    y: (x % 2 == 0 ? y : y + 0.5) * step
                }
                const size = step * Math.max(Math.abs(j/2), 0.1)
                p5.hexagon(p, size, t)
            }
        }
    }
}

export default sketch
