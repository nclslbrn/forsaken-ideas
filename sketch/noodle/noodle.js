/// <reference path="../../node_modules/@types/p5/global.d.ts" />
import { newExpression } from 'babel-types'

const sketch = (p5) => {
    const points = []
    const numFrame = 60
    let margin = 4
    let w, h, r, d

    // alias createVector function
    const pVec = (x, y) => {
        return p5.createVector(x, y)
    }
    p5.setup = () => {
        p5.createCanvas(600, 600)
        p5.noFill()
        p5.stroke(255)

        w = p5.width / 16
        h = p5.height / 16
        d = p5.max(w, h) / numFrame
        r = w / 4

        for (let x = 0; x < p5.width; x += w) {
            for (let y = 0; y < p5.height; y += h) {
                points.push(
                    pVec(x + (p5.random(2) - 1) * r, y + (p5.random(2) - 1) * r)
                )
                points.push(
                    pVec(
                        x + (p5.random(2) - 1) * r,
                        y + (p5.random(2) - 1) * r + h
                    )
                )
                points.push(
                    pVec(
                        x + (p5.random(2) - 1) * r + w / 2,
                        y + (p5.random(2) - 1) * r + h / 2
                    )
                )
                points.push(
                    pVec(
                        x + (p5.random(2) - 1) * r + w / 2,
                        y + (p5.random(2) - 1) * r + h / 2
                    )
                )
                points.push(
                    pVec(
                        x + (p5.random(2) - 1) * r + w,
                        y + (p5.random(2) - 1) * r + h
                    )
                )
                points.push(
                    pVec(
                        x + (p5.random(2) - 1) * r + w,
                        y + (p5.random(2) - 1) * r
                    )
                )
            }
        }
    }
    p5.draw = () => {
        const t = (p5.frameCount % numFrame) / numFrame

        const pointToDisplace = p5.round(
            p5.map(p5.frameCount % numFrame, 0, numFrame, 0, points.length / 6)
        )

        p5.background(0)

        if (points[pointToDisplace * 6]) {
            //console.log(pointToDisplace * 4 + ' exists')
            if (p5.random(1) > 0.5) {
                for (let g = 0; g < 6; g++) {
                    points[pointToDisplace * 6 + g].y += h
                }
            } else {
                for (let g = 0; g < 6; g++) {
                    points[pointToDisplace * 6 + g].x += w
                }
            }
        }
        for (let i in points) {
            points[i].x += d
            points[i].y += d
        }
        for (let j = 0; j < points.length / 6 - 1; j++) {
            const k = j * 6

            if (points[k].x >= p5.width || points[k].y >= p5.height) {
                for (let l = 0; l < 6; l++) {
                    points[k + l].x -= p5.width
                    points[k + l].y -= p5.height
                }
            }

            p5.beginShape()
            for (let l = 0; l < 6; l++) {
                p5.curveVertex(points[k + l].x, points[k + l].y)
            }
            p5.endShape(p5.CLOSE)
        }
    }
}
export default sketch
