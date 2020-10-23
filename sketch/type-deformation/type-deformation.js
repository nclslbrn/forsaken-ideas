/// <reference path="../../node_modules/@types/p5/index.d.ts" />
import words from '../../src/json/e-m-g-words.json'
const eWords = words.e
let canvas

const sketch = (p5) => {
    const numFrame = 600
    const initScale = 0.001
    const particlesCount = 60
    const backgroundCol = 8
    let font, word, lettersPoints, bounds, scale, margin, particles

    const noiseScale = (x, y, z, scale) => {
        return scale * p5.map(p5.noise(x, y, z), 0, 1, -1, 1)
    }

    sketch.init = () => {
        word = eWords[p5.floor(p5.random() * eWords.length)] //.toUpperCase()
        lettersPoints = []
        let _x = 0
        for (let i = 0; i < word.length; i++) {
            const points = font.textToPoints(word.charAt(i), 0, 0, 15, {
                sampleFactor: 20,
                simplifyThreshold: 0.1
            })

            for (let j = 0; j < points.length; j++) {
                points[j].x += _x
            }
            lettersPoints[i] = points
            const letterBounds = font.textBounds(word.charAt(i), 0, 0, 15)
            _x += letterBounds.w
        }

        bounds = font.textBounds(` ${word} `, 0, 0, 15)
        scale = initScale
        particles = []
        for (let i = 0; i < particlesCount; i++) {
            const letter = Math.floor(Math.random() * lettersPoints.length)
            const point =
                lettersPoints[letter][
                    Math.floor(Math.random() * lettersPoints[letter].length)
                ]
            particles.push({ x: point.x, y: point.y })
        }
        p5.background(backgroundCol)
    }
    sketch.exportPNG = () => {
        const date = new Date()
        const filename = `Types-deformation-${date.getHours()}.${date.getMinutes()}.${date.getSeconds()}--copyright_Nicolas_Lebrun_CC-by-3.0`
        p5.saveCanvas(canvas, filename, 'png')
    }
    p5.preload = () => {
        font = p5.loadFont('assets/Inter-Bold.otf')
    }
    p5.setup = () => {
        canvas = p5.createCanvas(window.innerWidth, window.innerHeight)
        margin = p5.width * 0.15
        p5.stroke(200, 200)
        p5.fill(backgroundCol, 200)
        sketch.init()
    }
    p5.draw = () => {
        if (p5.frameCount % numFrame !== 0) {
            const t = (p5.frameCount % numFrame) / numFrame

            for (let i = 0; i < lettersPoints.length; i++) {
                p5.push()
                p5.translate(p5.width / bounds.x, 0)
                p5.beginShape()

                for (let j = 0; j < lettersPoints[i].length; j++) {
                    const x = p5.map(
                        lettersPoints[i][j].x,
                        bounds.x,
                        bounds.w,
                        margin,
                        p5.width - margin
                    )
                    const y = p5.map(
                        lettersPoints[i][j].y,
                        bounds.y,
                        bounds.h,
                        p5.height * 0.27,
                        p5.height
                    )

                    p5.vertex(x, y)
                    const n1 = noiseScale(
                        lettersPoints[i][j].x,
                        lettersPoints[i][j].y,
                        t,
                        30
                    )
                    const n2 = noiseScale(
                        lettersPoints[i][j].x,
                        lettersPoints[i][j].y,
                        t,
                        15
                    )
                    const n3 = noiseScale(
                        lettersPoints[i][j].x,
                        lettersPoints[i][j].y,
                        t,
                        10
                    )

                    const v = {
                        x: Math.cos(n1 + n2 + n3),
                        y: Math.sin(n1 + n2 + n3)
                    }
                    lettersPoints[i][j].x += v.x * scale
                    lettersPoints[i][j].y += v.y * scale
                }
                p5.endShape(p5.CLOSE)
                p5.pop()
            }

            for (let i = 0; i < particles.length; i++) {
                const x = p5.map(
                    particles[i].x,
                    bounds.x,
                    bounds.w,
                    margin,
                    p5.width - margin
                )
                const y = p5.map(
                    particles[i].y,
                    bounds.y,
                    bounds.h,
                    p5.height * 0.27,
                    p5.height
                )
                p5.ellipse(x, y, 2)
                const n1 = noiseScale(particles[i].x, particles[i].y, t, 1)
                const v = {
                    x: Math.cos(p5.HALF_PI + n1),
                    y: Math.sin(p5.HALF_PI + n1)
                }
                particles[i].x += v.x * scale
                particles[i].y += v.y * scale
            }
            scale += 0.00008
            // smooth word transition
            if (t > 0.9) {
                p5.background(backgroundCol, (t - 0.9) * 2550)
            }
        } else {
            sketch.init()
        }
    }
    p5.windowResized = () => {
        p5.resizeCanvas(window.innerWidth, window.innerHeight)
        p5.background(backgroundCol)
        margin = p5.width * 0.25
    }
}
export default sketch
