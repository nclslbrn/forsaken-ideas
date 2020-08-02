/// <reference path="../../node_modules/@types/p5/global.d.ts" />
const sketch = (p5) => {
    const points = []
    const res = 0.1
    const scale = 0.01
    const noiseScale = p5.random(2, 5)
    const ratio = window.innerWidth / window.innerHeight

    p5.setup = () => {
        p5.createCanvas(window.innerWidth, window.innerHeight)
        p5.background(255)

        for (let x = -3 * ratio; x <= 3 * ratio; x += res) {
            for (let y = -3; y <= 3; y += res) {
                const noise = p5.noise(x, y) * 15

                points.push(
                    p5.createVector(
                        x + p5.random(noise) * res * p5.cos(noise),
                        y + p5.random(noise) * res * p5.sin(noise)
                    )
                )
            }
        }
    }

    p5.draw = () => {
        for (let p in points) {
            /**
             * Draw vectors
             */
            const yy = p5.map(
                points[p].y,
                -6.5 / ratio,
                6.5 / ratio,
                p5.height / 2 - p5.height / 4,
                p5.height / 2 + p5.height / 4
            )
            // skew 2D
            const xx = p5.map(
                points[p].x,
                -6.5 / (yy / 500),
                6.5 / (yy / 500),
                p5.width / 2 - (p5.width - p5.height) / 2,
                p5.width / 2 + (p5.width - p5.height) / 2
            )

            // regular 2D
            // const xx = p5.map(points[p].x, -6.5, 6.5, 0, p5.width)
            p5.stroke(0, p5.map(yy, 0, p5.height, 0, 100))
            p5.point(xx, yy)

            /**
             * Compute vectors
             */
            const n1a =
                noiseScale *
                p5.map(p5.noise(points[p].x * 2, points[p].y * 2), 0, 1, -1, 1)
            const n1b =
                noiseScale *
                p5.map(p5.noise(points[p].x * 5, points[p].y * 5), 0, 1, -1, 1)
            const v1 = p5.createVector(p5.cos(n1a), p5.sin(n1b))
            const r = v1.mag() + 1.0e-10
            const theta = p5.atan2(v1.x, v1.y)
            const sec = 1 / p5.cos(theta)
            const v2 = p5.createVector(sec * v1.x, p5.tan(v1.y) * sec * v1.y)

            points[p].x += scale * v2.x
            points[p].y += scale * v2.y
        }
    }
}
export default sketch
