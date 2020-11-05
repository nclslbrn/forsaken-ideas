import * as tome from 'chromotome'
import planeCurveFuncs from '../../src/js/sketch-common/plane-curve'
import paramSlider from '../../src/js/sketch-common/param-slider'
import planeFunctionScale from './planeFunctionScale'
import darkPalettes from './darkPalettes'

let canvas

const sketch = (p5) => {
    let selectedFunc, sample, palette, points, colors, colorsId

    const scale = 0.001
    const alpha = 25
    const funcs = planeCurveFuncs(p5)
    // A4 150dpi width
    const sketchWidth = 1280
    const sketchHeight = 1280
    const paramBox = document.createElement('div')
    paramBox.id = 'interactiveParameter'
    document.body.appendChild(paramBox)
    const colorBlocks = document.createElement('div')
    colorBlocks.id = 'colorBlocks'
    const paletteNameElem = document.createElement('p')
    paramBox.appendChild(paletteNameElem)
    paramBox.appendChild(colorBlocks)

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
        const functions = Object.keys(funcs)
        const randomFunc =
            functions[Math.floor(functions.length * Math.random())]
        // const randomFunc = 'hyperbola'
        // loop through functions in func
        Object.entries(funcs).forEach((func) => {
            // create option for each them
            const funcName = func[0].replaceAll('_', ' ')
            const funcOption = document.createElement('option')
            funcOption.appendChild(document.createTextNode(funcName))
            funcOption.value = func[0]
            // set default function to the last one
            if (randomFunc === func[0]) {
                selectedFunc = func[0]
                funcOption.selected = 'selected'
            }
            funcSelector.appendChild(funcOption)
        })
        console.log(selectedFunc)
        sample = planeFunctionScale[selectedFunc]

        paramBox.appendChild(funcSelector)
        // change selected function when user change it
        funcSelector.addEventListener('change', (event) => {
            selectedFunc = funcSelector.value
            sample = planeFunctionScale[selectedFunc]
            sketch.init()
        })
    }

    sketch.init = () => {
        sketch.resetPoint()
        p5.background(p5.color(palette.background || palette.stroke || 0))
    }

    sketch.resetPalette = () => {
        palette = tome.get(
            darkPalettes[Math.floor(darkPalettes.length * Math.random())]
        )
        colors = []
        colorBlocks.innerHTML = ''
        colors = palette.colors.map((c) => {
            const color = p5.color(c)
            color.setAlpha(alpha)

            const colorElem = document.createElement('div')
            colorElem.classList.add('color')
            let style =
                'width:' + 100 / palette.colors.length + '%; height: 24px; '
            style += `background-color: ${c};`
            colorElem.setAttribute('style', style)
            colorBlocks.appendChild(colorElem)

            return color
        })
        paletteNameElem.innerText = `Palette : ${palette.name}`
    }

    sketch.resetPoint = () => {
        points = []
        colorsId = []
        for (let a = -1; a <= 1; a += 0.0005) {
            const point = p5.createVector(
                p5.randomGaussian() * Math.cos(a),
                p5.randomGaussian() * Math.sin(a)
            )
            // point.normalize()
            const v = funcs[selectedFunc](point)
            points.push(v)
            colorsId.push(Math.floor(Math.random() * palette.colors.length))
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
        canvas.elt.setAttribute('style', `max-width: 50vw; max-height: 50vw;`)
        p5.strokeWeight(2)
        p5.smooth(5)
        sketch.planeCurveFunctionSelector()
        sketch.resetPalette()
        sketch.resetPoint()
        if (window.devicePixelRatio > 1)
            p5.pixelDensity(window.devicePixelRatio)
        p5.background(p5.color(palette.background || palette.stroke || 0))
    }

    p5.draw = () => {
        for (let p = 0; p < points.length; p++) {
            const v1 = funcs[selectedFunc](points[p])
            const a1 = Math.atan2(v1.x, v1.y)
            const a2 =
                p5.map(p5.noise(Math.cos(v1.x), Math.sin(v1.y)), 0, 1, -1, 1) *
                150

            const v3 = p5.createVector(Math.cos(a1 * a2), Math.sin(a1 * a2))
            const v4 = funcs['sinusoidal'](v3)

            points[p].x += v4.x * scale
            points[p].y += v4.y * scale

            const xx = p5.map(points[p].x, -sample, sample, 0, p5.width)
            const yy = p5.map(points[p].y, -sample, sample, 0, p5.height)

            p5.stroke(colors[colorsId[p]])
            p5.point(xx, yy)
        }
    }

    p5.windowResized = () => {
        const size = sketch.size(sketchWidth, sketchHeight)
        p5.resizeCanvas(size.w, size.h)
    }
}
export default sketch
