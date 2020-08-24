/// <reference path="../../node_modules/@types/p5/global.d.ts" />
/**
 * cols = 3
 * rows = 4
 *
 * 0 - 4 - 8
 * 1 - 5 - 9
 * 2 - 6 - 10
 * 3 - 7 - 11
 * @param {*} p5
 */
const sketch = (p5) => {
    const debug = false
    let size, cols, rows, points, t
    sketch.init = () => {
        size = 64
        cols = p5.floor(window.innerWidth / size)
        rows = p5.floor(window.innerHeight / size)
        points = []
        t = 0

        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                points.push({
                    weight: p5.noise(x, y, 0),
                    x: x,
                    y: y
                })
            }
        }
    }
    const getNextPoint = (index) => {
        const selection = []
        const sides = [
            index - 1 > 0 && (index - 1) % rows !== 0 && index % rows !== 0
                ? index - 1
                : false,
            index + rows < cols * rows && (index + rows) % rows !== 0
                ? index + rows
                : false,
            index + 1 < cols * rows && (index + 1) % rows !== 0
                ? index + 1
                : false,
            index - rows > 0 && (index - rows) % rows !== 0
                ? index - rows
                : false
        ]

        for (let i = 0; i < sides.length; i++) {
            if (sides[i] && points[sides[i]].weight < 0.45) {
                selection.push(sides[i])
            }
        }
        return selection
    }

    p5.setup = () => {
        init()
        p5.createCanvas(cols * size, rows * size)
        p5.strokeWeight(8)
        p5.stroke(255)
    }

    p5.draw = () => {
        // slowdown animation to debug it
        if (!debug || (debug && p5.frameCount % 12 == 0)) {
            p5.background(0)
            // p5.noStroke()
            for (let i = 0; i < points.length; i++) {
                points[i].weight = p5.noise(points[i].x, points[i].y, t)
                // p5.fill(points[i].weight * 255)
                // p5.rect(points[i].x * size, points[i].y * size, size, size)
            }
            for (let j = 0; j < points.length; j++) {
                const nexts = getNextPoint(j)
                for (let k = 0; k < nexts.length; k++) {
                    p5.line(
                        points[j].x * size + size / 2,
                        points[j].y * size + size / 2,
                        points[nexts[k]].x * size + size / 2,
                        points[nexts[k]].y * size + size / 2
                    )
                }
            }
            t += 0.005
        }
    }

    p5.windowResized = () => {
        init()
        p5.resizeCanvas(cols * size, rows * size)
    }
}
export default sketch
