import * as tome from 'chromotome'
import planeCurveFuncs from '../../src/js/sketch-common/plane-curve'
import paramSlider from '../../src/js/sketch-common/param-slider'

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
    const sample = {
        value: 15.0,
        options: {
            min: 1,
            max: 25,
            step: 0.5,
            label: 'Scale'
        }
    }
    const noiseSample = 300
    const alpha = 25
    const funcs = planeCurveFuncs(p5)
    let selectedFunc, palette, points, colors
    // A4 150dpi width
    const sketchWidth = 1280
    const sketchHeight = 1280
    const paramBox = document.createElement('div')
    paramBox.id = 'interactiveParameter'
    document.body.appendChild(paramBox)

    sketch.size = (sketchWidth, sketchHeight) => {
        const ratio = sketchWidth / sketchHeight
        const side = p5.min(window.innerWidth, window.innerHeight)
        return {
            w: side > 800 ? sketchWidth : side * ratio,
            h: side > 800 ? sketchHeight : side
        }
    }
    sketch.planeCurveFunctionSelector = () => {
        const funcSelector = document.createElement('select')
        const lastFunc = Object.keys(funcs).pop()
        // loop through functions in func
        Object.entries(funcs).forEach((func) => {
            // create option for each them
            const funcName = func[0].replace('_', ' ')
            const funcOption = document.createElement('option')
            funcOption.appendChild(document.createTextNode(funcName))
            funcOption.value = func[0]
            // set default function to the last one
            if (lastFunc === func[0]) {
                selectedFunc = func[0]
                funcOption.selected = 'selected'
            }
            funcSelector.appendChild(funcOption)
        })
        paramBox.appendChild(funcSelector)
        // change selected function when user change it
        funcSelector.addEventListener('change', (event) => {
            selectedFunc = funcSelector.value
            sketch.init()
        })
    }
    sketch.init = () => {
        sketch.resetPointAndColors()
        p5.background(p5.color(palette.background || palette.stroke || 0))
    }
    sketch.resetPalette = () => {
        palette = tome.get(
            selPalette[Math.floor(Math.random() * selPalette.length)]
        )
    }
    sketch.resetPointAndColors = () => {
        points = []
        colors = []
        for (let a = -1; a <= 1; a += 0.0005) {
            const point = p5.createVector(
                p5.randomGaussian() * Math.cos(a),
                p5.randomGaussian() * Math.sin(a)
            )
            // point.normalize()
            const v = funcs[selectedFunc](point)
            points.push(v)
            const color = p5.color(p5.random(palette.colors))
            color.setAlpha(alpha)
            colors.push(color)
        }
    }

    sketch.PNG = () => {
        const date = new Date()
        const filename =
            'Polar-curve.' +
            selectedFunc +
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
        canvas.elt.setAttribute('style', 'height: 80vh; width: auto;')
        sketch.planeCurveFunctionSelector()
        const slider = paramSlider(sample)
        slider.forEach((elem) => {
            paramBox.appendChild(elem)
        })
        sketch.resetPalette()
        sketch.resetPointAndColors()
        p5.background(p5.color(palette.background || palette.stroke || 0))
    }
    p5.draw = () => {
        for (let p = 0; p < points.length; p++) {
            const p_ = funcs[selectedFunc](points[p])
            const a = Math.atan2(p_.x, p_.y)
            const n = p5.map(
                noiseSample * p5.noise(Math.cos(a), Math.sin(a)),
                0,
                1,
                -1,
                1
            )

            const _p = p5.createVector(Math.cos(n), Math.sin(n))
            p_.lerp(_p, 0.5)
            points[p].x += p_.x * scale
            points[p].y += p_.y * scale

            const xx = p5.map(
                points[p].x,
                -sample.value,
                sample.value,
                0,
                p5.width
            )
            const yy = p5.map(
                points[p].y,
                -sample.value,
                sample.value,
                0,
                p5.height
            )

            p5.stroke(colors[p])
            p5.point(xx, yy)
        }
    }
    p5.windowResized = () => {
        const size = sketch.size(sketchWidth, sketchHeight)
        p5.resizeCanvas(size.w, size.h)
    }
}
export default sketch
