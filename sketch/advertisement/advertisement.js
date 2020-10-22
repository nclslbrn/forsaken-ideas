/// <reference path="../../node_modules/@types/p5/index.d.ts" />
import words from '../../src/json/e-m-g-words.json'
const eWords = words.e

const sketch = (p5) => {
    const numFrame = 600
    const scale = 0.005
    let font, word, points, bounds
    sketch.init = () => {
        word = eWords[p5.floor(p5.random() * eWords.length)]
        word.toUpperCase()
        points = font.textToPoints(word, 0, 0, 15, {
            sampleFactor: 5,
            simplifyThreshold: 0
        })
        bounds = font.textBounds(' ' + word + ' ', 0, 0, 15)
        p5.background(0)
        console.log('num point', points.length)
    }
    p5.preload = () => {
        font = p5.loadFont('assets/Inter-Bold.otf')
    }
    p5.setup = () => {
        p5.createCanvas(window.innerWidth, window.innerHeight)
        p5.background(0)
        p5.fill(0, 50, 25)
        p5.stroke(255, 120)
        sketch.init()
    }
    p5.draw = () => {
        if (p5.frameCount % numFrame !== 0) {
            const t = (p5.frameCount % numFrame) / numFrame

            p5.translate(
                -bounds.x * (p5.width / bounds.w),
                -bounds.y * (p5.height / bounds.h)
            )
            p5.beginShape()
            for (let i = 0; i < points.length; i++) {
                p5.vertex(
                    (points[i].x * p5.width) / bounds.w,
                    (points[i].y * p5.height) / bounds.h
                )
                const n1 = 300 * p5.noise(points[i].x, points[i].y, t)
                const n2 = 100 * p5.noise(points[i].x, points[i].y, t)
                const n3 = 5 * p5.noise(points[i].x, points[i].y, t)

                const v = p5.createVector(
                    Math.cos((n1 + n2 + n3) / 3),
                    Math.sin((n1 + n2 + n3) / 3)
                )
                points[i].x += v.x * scale
                points[i].y += v.y * scale
            }
            p5.endShape()
            //p5.text(word, p5.width / 2, p5.height / 2)
        } else {
            sketch.init()
        }
    }
    p5.windowResized = () => {
        p5.resizeCanvas(window.innerWidth, window.innerHeight)
    }
}
export default sketch
