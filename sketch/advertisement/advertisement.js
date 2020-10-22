/// <reference path="../../node_modules/@types/p5/index.d.ts" />
import words from '../../src/json/e-m-g-words.json'
const eWords = words.e

const sketch = (p5) => {
    const numFrame = 600
    const scale = 0.005
    let font, word, points, bounds

    const noiseScale = (x, y, z, scale) => {
        return scale * p5.map(p5.noise(x, y, z), 0, 1, -1, 1)
    }
    sketch.init = () => {
        word = eWords[p5.floor(p5.random() * eWords.length)]
        word.toUpperCase()
        points = font.textToPoints(word, 0, 0, 15, {
            sampleFactor: 15,
            simplifyThreshold: 0.1
        })
        bounds = font.textBounds(` ${word} `, 0, 0, 15)
        p5.background(0, 150)
    }
    p5.preload = () => {
        font = p5.loadFont('assets/Inter-Bold.otf')
    }
    p5.setup = () => {
        p5.createCanvas(window.innerWidth, window.innerHeight)
        p5.fill(0, 120)
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
                const n1 = noiseScale(points[i].x, points[i].y, t, 15)
                const n2 = noiseScale(points[i].x, points[i].y, t, 5)
                const n3 = noiseScale(points[i].x, points[i].y, t, 0.5)

                const v = p5.createVector(
                    Math.cos(n1 * n2 * n3),
                    Math.sin(n1 * n2 * n3)
                )
                points[i].x += v.x * scale
                points[i].y += v.y * scale
            }
            p5.endShape()
            //p5.text(word, p5.width / 2, p5.height / 2)
        } else {
            p5.background(0, 150)
            sketch.init()
        }
    }
    p5.windowResized = () => {
        p5.resizeCanvas(window.innerWidth, window.innerHeight)
    }
}
export default sketch
