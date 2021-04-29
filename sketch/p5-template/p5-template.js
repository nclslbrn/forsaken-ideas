import * as tome from 'chromotome'
import planeCurveFuncs from '../../src/js/sketch-common/plane-curve'

const sketch = (p5) => {
    const funcs = planeCurveFuncs(p5)
    const alpha = 50
    const scale = 0.00085

    let canvas, canvasSide, trigoFunc, points, palette
    const numFrame = 400
    const sketchSize = () => {
        const side = Math.min(window.innerWidth, window.innerHeight)
        return side > 800 ? 800 : side * 0.85
    }
    const randomTrigoFunc = () => {
        const funcsName = []
        Object.entries(funcs).forEach((func) => {
            funcsName.push(func[0])
        })
        return funcsName[Math.floor(Math.random() * funcsName.length)]
    }
    const initPoint = () => {
        const points = []
        const scale = 96
        const res = 8
        const a = [3, 5, 6, 7, 9, 10, 11, 12, 13, 15]
        const g = a[Math.floor(Math.random() * a.length)]
        console.log('g', g)
        for (let x = 0; x <= canvasSide; x += scale) {
            for (let y = 0; y <= canvasSide; y += scale) {
                if ((x ^ y) % g) {
                    for (let dx = 0; dx <= scale; dx += res) {
                        for (let dy = 0; dy <= scale; dy += res) {
                            points.push({
                                x: ((x + dx) / canvasSide) * 6 - 3,
                                y: ((y + dy) / canvasSide) * 6 - 3
                            })
                        }
                    }
                }
            }
        }
        return points
    }
    const circle = function (theta) {
        return p5.createVector(p5.cos(theta), p5.sin(theta))
    }
    p5.setup = () => {
        canvasSide = sketchSize()
        palette = tome.get()

        canvas = p5.createCanvas(canvasSide, canvasSide)
        p5.stroke(255)

        trigoFunc = randomTrigoFunc()
        points = initPoint()
        p5.background(0)
    }
    p5.draw = () => {
        for (let p = 0; p < points.length; p++) {
            const xx = p5.map(points[p].x, -4, 4, 0, p5.width)
            const yy = p5.map(points[p].y, -4, 4, 0, p5.height)

            const n1 =
                500 * p5.map(p5.noise(points[p].x, points[p].y), 0, 1, -1, 1)
            const v1 = circle(n1)
            const v2 = funcs[trigoFunc](v1)
            const v = funcs['sinusoidal'](v2)
            let pointColor = p5.color(p5.random(palette.colors))
            pointColor.setAlpha(alpha)
            p5.stroke(pointColor)
            p5.point(xx, yy)

            points[p].x += scale * v.x
            points[p].y += scale * v.y
        }
    }
    p5.windowResized = () => {
        p5.resizeCanvas(window.innerWidth, window.innerHeight)
    }

    sketch.download_PNG = () => {
        const date = new Date()
        const filename =
            'untitled.' +
            trigoFunc +
            '.' +
            date.getHours() +
            '.' +
            date.getMinutes() +
            '.' +
            date.getSeconds() +
            '--copyright_Nicolas_Lebrun_CC-by-3.0'
        p5.save(canvas, filename, 'png')
    }
}
export default sketch
