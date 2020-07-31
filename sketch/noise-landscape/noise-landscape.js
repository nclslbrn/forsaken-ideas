/// <reference path="../../node_modules/@types/p5/global.d.ts" />
const sketch = (p5) => {
    const points = []
    const res = 0.05
    const scale = 0.01
    const noiseScale = window.innerWidth
    const ratio = window.innerWidth / window.innerHeight

    p5.setup = () => {
        p5.createCanvas(window.innerWidth, window.innerHeight)
        p5.background(255)
        p5.stroke(0, 35)

        for (let x = -3 * ratio; x <= 3 * ratio; x += res) {
            for (let y = -3; y <= 3; y += res) {
                points.push(
                    p5.createVector(
                        x + p5.random(1) * res,
                        y + p5.random(1) * res
                    )
                )
            }
        }
    }

    p5.draw = () => {
        for (let p in points) {
            const xx = p5.map(points[p].x, -5, 5, 0, p5.width)
            const yy = p5.map(points[p].y, -5 / ratio, 5 / ratio, 0, p5.height)

            const n1 = p5.map(
                10 * p5.noise(points[p].x, points[p].y),
                0,
                1,
                -1,
                1
            )
            const n2 = p5.map(
                p5.noise(points[p].x / 10, points[p].y / 10),
                0,
                1,
                -1,
                1
            )
            const n3 = 5 * p5.map(p5.noise(n1, n2), 0, 1, -1, 1)
            const v1 = p5.createVector(p5.cos(n3), p5.sin(n3))

            const theta = 5 * p5.atan2(v1.x, v1.y)
            const v3 = p5.createVector(
                p5.pow(p5.cos(theta), 3),
                p5.pow(p5.sin(theta), 3)
            )
            p5.point(xx, yy)

            points[p].x += scale * v3.x
            points[p].y += scale * v3.y
        }
    }
}
export default sketch
