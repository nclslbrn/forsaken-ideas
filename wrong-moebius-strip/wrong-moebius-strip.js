import { newExpression } from 'babel-types'

const sketch = (p5) => {
    const numFrame = 60
    let p1, v1, center
    const n = 12
    const radius = 100
    const arcs = 26
    const arcLenght = 26
    let pb = []

    p5.setup = () => {
        p5.createCanvas(800, 800)
        center = p5.createVector(p5.width / 2, p5.height / 2)
        p5.fill(127)
        p5.stroke(255)
        p5.strokeWeight(1.5)
    }
    p5.draw = () => {
        p5.background(50)

        const t = (p5.frameCount % numFrame) / numFrame
        const tt = t < 0.5 ? t : 1 - t

        let i = 0
        let ps = []
        let p = 0,
            pn = 0,
            pn1 = 0

        for (let theta1 = 0; theta1 <= p5.TWO_PI; theta1 += p5.TWO_PI / arcs) {
            const theta2 = p5.PI * t
            const p1 = p5.createVector(
                p5.width / 2 + radius * p5.cos(theta1 + theta2),
                p5.height / 2 + radius * p5.sin(theta1 + theta2)
            )

            p5.ellipse(p1.x, p1.y, 8)
            if (p !== 0) p5.line(p.x, p.y, p1.x, p1.y)
            pn1 = p = p1
            //ps.push(p1)

            for (let j = n; j > -1; j--) {
                const lambda = (p5.TWO_PI * i) / arcs + (p5.PI * j) / n
                const theta3 = p5.PI + theta1 + lambda

                const p2 = p5.createVector(
                    pn1.x + arcLenght * p5.sin(j / n) * p5.cos(theta3),
                    pn1.y + arcLenght * p5.sin(j / n) * p5.sin(theta3)
                )

                if (ps[j] && ps[j - 1]) {
                    p5.line(pn1.x, pn1.y, p2.x, p2.y)
                    p5.line(p2.x, p2.y, ps[j].x, ps[j].y)
                }

                pn1 = p2
                ps[j] = p2
            }

            i++
        }
    }
}

export default sketch
