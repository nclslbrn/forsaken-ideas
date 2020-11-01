import ease from '../../src/js/sketch-common/ease'
import * as tome from 'chromotome'
import planeCurveFuncs from '../../src/js/sketch-common/plane-curve'
const selFuncs = [
    'kilroy_curve',
    'julia',
    'kampyle',
    'hyperbolic',
    'maltese_cross',
    'catenary',

    'cochlioid',
    'sinusoidal'
]
const selPalette = [
    'retro',
    'retro-washedout',
    'miradors',
    'tundra4',
    'floratopia',
    'roygbiv-toned',
    'roygbiv-warm',
    'yuma_punk',
    'butterfly',
    'revolucion'
]
let canvas

const sketch = (p5) => {
    const scale = 0.005
    const sample = 5
    const numFrame = 360
    const alpha = 25
    const funcs = planeCurveFuncs(p5)

    /*   const functionNames = Object.entries(funcs).map((func_name) => {
        return func_name[0]
    }) */

    let points = []
    let colors = []
    let loop = 0
    let planeFunction, choosenJoinFunc, palette
    // A4 150dpi width
    const sketchWidth = 1280
    const sketchHeight = 1280

    sketch.size = (sketchWidth, sketchHeight) => {
        const ratio = sketchWidth / sketchHeight
        const side = p5.min(window.innerWidth, window.innerHeight)
        return {
            w: side > 800 ? sketchWidth : side * ratio,
            h: side > 800 ? sketchHeight : side
        }
    }
    sketch.init = () => {
        planeFunction = selFuncs[Math.floor(p5.random() * selFuncs.length)]
        palette = tome.get(
            selPalette[Math.floor(p5.random() * selPalette.length)]
        )
        points = []
        for (let a = -1; a <= 1; a += 0.0005) {
            const point = p5.createVector(
                p5.randomGaussian() * Math.cos(a),
                p5.randomGaussian() * Math.sin(a)
            )
            // point.normalize()
            const v = funcs[planeFunction](point)
            points.push(v)
            const color = p5.color(p5.random(palette.colors))
            color.setAlpha(alpha)
            colors.push(color)
        }

        p5.background(p5.color(palette.background || palette.stroke || 0))
        console.log('function: ', planeFunction, ' palette: ', palette.name)
    }
    sketch.PNG = () => {
        const date = new Date()
        const filename =
            'Double-curve.' +
            planeFunction +
            '.' +
            date.getHours() +
            '.' +
            date.getMinutes() +
            '.' +
            date.getSeconds() +
            '--copyright_Nicolas_Lebrun_CC-by-3.0'
        p5.save(canvas, filename, 'png')
    }
    p5.setup = () => {
        const size = sketch.size(sketchWidth, sketchHeight)
        canvas = p5.createCanvas(size.w, size.h)
        canvas.elt.setAttribute(
            'style',
            `max-width: ${sketchWidth / 2}px; max-height: ${sketchHeight / 2}px`
        )
        sketch.init()
    }
    p5.draw = () => {
        if (p5.frameCount % numFrame == 0) {
            sketch.init()
        } else {
            const t = (p5.frameCount % numFrame) / numFrame
            for (let p = 0; p < points.length; p++) {
                const p_ = funcs[planeFunction](points[p])
                const a = Math.tan(p_.x, p_.y)
                const n =
                    p5.map(
                        p5.noise(Math.cos(a) / sample, Math.sin(a) / sample, t),
                        0,
                        1,
                        -1,
                        1
                    ) / scale
                const _p = p5.createVector(Math.cos(n), Math.sin(n))

                points[p].x += _p.x * scale
                points[p].y += _p.y * scale

                const xx = p5.map(points[p].x, -sample, sample, 0, p5.width)
                const yy = p5.map(points[p].y, -sample, sample, 0, p5.height)

                p5.stroke(colors[p])
                p5.point(xx, yy)
            }
        }
    }
    p5.windowResized = () => {
        const size = sketch.size(sketchWidth, sketchHeight)
        p5.resizeCanvas(size.w, size.h)
    }
}
export default sketch
