import '../framed-canvas.css'
import p5 from 'p5'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import Emitter from './Emitter'
import getPalette from './palette'

const { sin, cos, atan2, sqrt, PI, max, min, round, hypot } = Math,
    numLoop = 50,
    divStack = [2, 4, 6, 8, 10],
    verticeStack = [3, 4, 5]

const sketch = (p5) => {
    let currLoop = 0,
        emitter,
        noiseFrequency,
        noiseTurbulence,
        division,
        angle,
        palette,
        canvas,
        minSize = min(window.innerWidth, window.innerHeight) * 1.2,
        size = [minSize, minSize],
        diag = hypot(...size),
        center = size.map((d) => d / 2),
        shapeVertice = 0,
        dots = [],
        planes = []

    sketch.init = () => {
        currLoop = 0
        palette = [
            ...getPalette(),
            [25, 25, 25],
            [50, 50, 50],
            [75, 75, 75],
            [100, 100, 100],
            [150, 150, 150]
        ]
        division = divStack[Math.floor(Math.random() * divStack.length)]
        angle = (PI * 2) / division
        shapeVertice =
            verticeStack[Math.floor(Math.random() * verticeStack.length)]
        dots = []
        planes = []
        noiseFrequency = round((3 + Math.random() * 4) * 10) / 1000
        noiseTurbulence = 40 + round(Math.random() * 300)
        p5.background(245)
        p5.fill(0)

        for (let i = 0; i < 100 / division; i++) {
            const randPos = {
                r: p5.random(0.01, 0.6) * diag * 0.5,
                l: Math.random() * angle
            }
            dots.push(randPos)
            const side = max(...center) * p5.random(0.05, 0.1)
            const pts = []
            const middle = unpolar(randPos)
            for (let j = 0; j < shapeVertice; j++) {
                const xy = [
                    middle[0] + side * cos(j * PI * 0.5),
                    middle[1] + side * sin(j * PI * 0.5)
                ]
                const pt = {
                    l: atan2(center[1] - xy[1], center[0] - xy[0]),
                    r: sqrt((center[0] - xy[0]) ** 2 + (center[1] - xy[1]) ** 2)
                }
                pts.push(pt)
            }
            const square = { pts: pts, col: i % palette.length }
            planes.push(square)
        }
        emitter = new Emitter(
            noiseFrequency,
            noiseTurbulence,
            palette,
            dotP,
            p5
        )
        planes.forEach((sq) => rectangle(sq))
        //p5.updatePixels()

        for (let x = 80; x <= p5.width - 80; x += 10) {
            for (let y = 80; y <= p5.height - 80; y += 10) {
                if (Math.random() > 0.25) {
                    dotP([x, y], 1, [150])
                }
            }
        }
    }
    sketch.download = () => {
        p5.save(canvas, 'Rorschach_psychodiagnostic', 'jpg')
    }
    const unpolar = (pt) => [
        center[0] + cos(pt.l) * pt.r,
        center[1] + sin(pt.l) * pt.r
    ]
    const dotP = (pt, s, c) => {
        const polar = {
            l: atan2(center[1] - pt[1], center[0] - pt[0]),
            r: sqrt((center[0] - pt[0]) ** 2 + (center[1] - pt[1]) ** 2)
        }
        p5.fill(...c)
        for (let i = 0; i < division; i++) {
            const theta = PI * 0.5 + p5.map(i, 0, division, 0, PI * 2)
            const carth = unpolar({
                ...polar,
                l: i % 2 === 0 ? theta + polar.l : theta + (angle - polar.l)
            })
            p5.ellipse(carth[0], carth[1], s)
        }
        p5.updatePixels()
    }
    const rectangle = (sq) => {
        for (let i = 0; i < division; i++) {
            const theta = PI * 0.5 + p5.map(i, 0, division, 0, PI * 2)
            const _pts = sq.pts.map((pt) =>
                unpolar({
                    ...pt,
                    l: i % 2 === 0 ? theta + pt.l : theta + (angle - pt.l)
                })
            )
            p5.fill(...palette[sq.col])
            p5.beginShape()
            for (let i = 0; i < _pts.length; i++) {
                p5.vertex(_pts[i][0], _pts[i][1])
            }
            p5.endShape(p5.CLOSE)
        }
    }

    p5.setup = () => {
        canvas = p5.createCanvas(...size)
        p5.pixelDensity(window.devicePixelRatio)
        p5.noStroke()
        sketch.init()
    }

    p5.draw = () => {
        if (currLoop < numLoop) {
            dots.forEach((pt, n) =>
                emitter.spread(
                    unpolar(pt),
                    n % palette.length,
                    min(center[0], center[1]) / 3,
                    currLoop + n * palette.length
                )
            )
            currLoop++
        }
    }
}

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

new p5(sketch, windowFrame)
windowFrame.removeChild(loader)
window.init = sketch.init
window.download = sketch.download
window.infobox = infobox
handleAction()
