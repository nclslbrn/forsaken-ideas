import words from '../../src/json/e-m-g-words.json'
import { generateHslaColors } from '../../src/js/sketch-common/generateHslaColors'
import planeCurveFuncs from '../../src/js/sketch-common/plane-curve'

const eWords = words.e
let canvas

const sketch = (p5) => {
    const numFrame = 400
    const initScale = 0.003
    const backgroundCol = 12
    const planarFuncs = planeCurveFuncs(p5)
    const everyFunction = Object.entries(planarFuncs).map((name) => name[0])
    let font,
        word,
        lettersPoints,
        bounds,
        scale,
        margin,
        colors,
        planarFunctionID

    const noiseScale = (x, y, z, scale) => {
        return scale * p5.map(p5.noise(x, y, z), 0, 1, -1, 1)
    }

    sketch.init = () => {
        word = eWords[p5.floor(p5.random() * eWords.length)] //.toUpperCase()
        lettersPoints = []
        colors = []
        let _x = 0
        for (let i = 0; i < word.length; i++) {
            const points = font.textToPoints(word.charAt(i), 0, 0, 15, {
                sampleFactor: 25,
                simplifyThreshold: 0.08
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
        colors = generateHslaColors(50, 90, 75, word.length).map((c) => {
            return p5.color(c[0], c[1], c[2], c[3])
        })
        planarFunctionID =
            everyFunction[Math.floor(Math.random() * everyFunction.length)]
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
        p5.colorMode(p5.HSL, 360, 100, 100, 100)
        p5.fill(backgroundCol, 200)
        sketch.init()
    }
    p5.draw = () => {
        if (p5.frameCount % numFrame !== 0) {
            const t = (p5.frameCount % numFrame) / numFrame

            for (let i = 0; i < lettersPoints.length; i++) {
                p5.push()
                p5.stroke(colors[i])
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
                        0.01
                    )

                    const v = {
                        x: Math.cos(n1 + n2 * n3),
                        y: Math.sin(n1 + n2 * n3)
                    }
                    const v2 = planarFuncs[planarFunctionID](
                        p5.createVector(v.x, v.y),
                        0.5
                    )
                    lettersPoints[i][j].x += v2.x * scale
                    lettersPoints[i][j].y += v2.y * scale
                }
                p5.endShape(p5.CLOSE)
                p5.pop()
            }
            // smooth word transition
            scale = t < 0.8 ? scale * 1.005 : scale * 0.85
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
