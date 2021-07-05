import * as tome from 'chromotome'
import funcs from '../../src/js/sketch-common/plane-curve'
import paramSlider from '../../src/js/sketch-common/param-slider'
import darkPalettes from './darkPalettes'

let canvas

const sketch = (p5) => {
    let selectedFunc, palette, points, colors, colorsId

    const scale = 0.01
    const alpha = 35
    const margin = 0.08
    const sample = 4

    // A4 150dpi width
    const sketchWidth = 1080
    const sketchHeight = 1080
    const windowFrame = document.getElementById('windowFrame')
    const paramBox = document.createElement('div')
    paramBox.id = 'interactiveParameter'
    windowFrame.appendChild(paramBox)
    const colorBlocks = document.createElement('div')
    colorBlocks.id = 'colorBlocks'
    const paletteNameElem = document.createElement('p')
    paramBox.appendChild(paletteNameElem)
    paramBox.appendChild(colorBlocks)

    sketch.size = (sketchWidth, sketchHeight) => {
        const ratio = sketchWidth / sketchHeight
        const side = p5.min(window.innerWidth, window.innerHeight)
        return {
            w: side > 1080 ? sketchWidth : side * ratio,
            h: side > 1080 ? sketchHeight : side
        }
    }

    sketch.planeCurveFunctionSelector = () => {
        const funcSelector = document.createElement('select')
        const functions = Object.keys(funcs)
        const randomFunc =
            functions[Math.floor(functions.length * Math.random())]
        //const randomFunc = 'sinusoidal'
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

        paramBox.appendChild(funcSelector)
        // change selected function when user change it
        funcSelector.addEventListener('change', (event) => {
            selectedFunc = funcSelector.value
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
            let style = 'width:' + 100 / palette.colors.length + '%; '
            style += 'height: 24px; '
            style += `background-color: ${c};`
            colorElem.setAttribute('style', style)
            colorBlocks.appendChild(colorElem)

            return color
        })
        paletteNameElem.innerHTML = `Palette : ${palette.name} `
        paletteNameElem.innerHTML +=
            'from <a href="https://kgolid.github.io/chromotome-site/">Chromotome</a>'
    }

    sketch.resetPoint = () => {
        points = []
        colorsId = []
        for (let a = 0; a <= Math.PI * 2; a += 0.001) {
            points.push(p5.createVector(Math.cos(a), Math.sin(a)))
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
        canvas.elt.setAttribute(
            'style',
            `display: block; max-height: 60vw; width: auto;`
        )
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
            const v0 = funcs[selectedFunc](points[p])
            const v1 = p5.createVector(v0.x, v0.y)
            const a1 = Math.atan2(v1.x, v1.y)
            const a2 =
                p5.map(p5.noise(Math.cos(a1), Math.sin(a1)), 0, 1, -1, 1) * 1000
            const v2 = p5.createVector(Math.cos(a2), Math.sin(a2))
            const v3 = v1.lerp(v2, 0.5)
            const v4 = funcs['sinusoidal'](v3, sample)

            const xx = p5.map(
                v4.x,
                -sample,
                sample,
                p5.width * margin,
                p5.width - p5.width * margin
            )
            const yy = p5.map(
                v4.y,
                -sample,
                sample,
                p5.height * margin,
                p5.height - p5.height * margin
            )
            p5.stroke(colors[colorsId[p]])
            p5.point(xx, yy)

            points[p].x += v4.x * scale
            points[p].y += v4.y * scale
        }
    }

    p5.windowResized = () => {
        const size = sketch.size(sketchWidth, sketchHeight)
        p5.resizeCanvas(size.w, size.h)
    }
}
export default sketch
