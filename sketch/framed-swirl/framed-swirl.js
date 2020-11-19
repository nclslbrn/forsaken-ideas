import planeCurveFuncs from '../../src/js/sketch-common/plane-curve'
import strangeAttractors from '../../src/js/sketch-common/strange-attractors'
import joinVector from './joinVector'
import { generateHslaColors } from '../../src/js/sketch-common/generateHslaColors'
const container = document.getElementById('windowFrame')
const sketch = (p5) => {
    const n = 2
    const x1 = -3
    const y1 = -3
    const x2 = 3
    const y2 = 3
    let y = y1
    let margin,
        step,
        drawing,
        planeFunction,
        attractor,
        canvas,
        choosenJoinFunc,
        colors,
        cartel

    // A4 150dpi canvas = p5.createCanvas(1754, 1280)
    const sketchWidth = 1280
    const sketchHeight = 1500
    const sketchSize = (sketchWidth, sketchHeight) => {
        const ratio = sketchWidth / sketchHeight
        const side = p5.min(window.innerWidth, window.innerHeight)
        return {
            w: side > 800 ? sketchWidth : side * ratio,
            h: side > 800 ? sketchHeight : side
        }
    }

    // displacement functions
    const funcs = planeCurveFuncs(p5)
    const attractors = strangeAttractors(p5).attractors

    const functionNames = Object.entries(funcs).map((func_name) => {
        return func_name[0]
    })
    const attractorNames = Object.entries(attractors).map((attr_name) => {
        return attr_name[0]
    })
    const {
        joinVectorFuncs,
        joinVectorFuncsNames,
        getOperatorSymbol
    } = joinVector(p5)

    const strFromVar = (variable) => {
        return variable.replaceAll('_', ' ').toUpperCase()
    }
    // draw function
    const drawVariation = (x, y) => {
        const v = p5.createVector(x, y)
        for (let i = 0; i < n; i++) {
            const v2 = funcs[planeFunction](v)
            const v3 = attractors[attractor](v)
            const v4 = joinVectorFuncs[choosenJoinFunc](v2, v3)
            const fv = funcs['sinusoidal'](v4, (x2 - x1) / 2)
            const xx = p5.map(
                fv.x + 0.0003 * p5.randomGaussian(),
                x1,
                x2,
                margin,
                p5.width - margin
            )
            const yy = p5.map(
                fv.y + 0.0003 * p5.randomGaussian(),
                y1,
                y2,
                margin,
                p5.height - margin
            )
            p5.point(xx, yy)
        }
    }
    p5.setup = () => {
        const sketchDim = sketchSize(sketchWidth, sketchHeight)
        margin = sketchDim.w / 16
        canvas = p5.createCanvas(sketchDim.w, sketchDim.h)

        canvas.elt.setAttribute(
            'style',
            `max-width: ${sketchWidth / 2}px; max-height: ${sketchHeight / 2}px`
        )

        //p5.strokeWeight(0.5)
        p5.pixelDensity(window.devicePixelRatio)
        p5.colorMode(p5.HSL, 360, 100, 100, 100)
        step = (p5.sqrt(n) * (x2 - x1)) / (p5.width * 0.8)
        cartel = document.createElement('div')
        cartel.id = 'cartel'
        container.appendChild(cartel)
        init_sketch()
    }
    p5.draw = () => {
        if (drawing) {
            for (let i = 0; (i < 20) & drawing; i++) {
                for (let x = x1; x <= x2; x += step) {
                    const color = colors[i % colors.length]
                    p5.stroke(color)
                    drawVariation(x, y)
                }
                y += step
                if (y > y2) {
                    drawing = false
                    const notification = document.createElement('p')
                    notification.innerHTML = 'Ready'
                    cartel.appendChild(notification)
                }
            }
        }
    }

    sketch.init_sketch = () => {
        drawing = true
        y = y1
        choosenJoinFunc =
            joinVectorFuncsNames[
                p5.floor(p5.random() * joinVectorFuncsNames.length)
            ]
        planeFunction =
            functionNames[p5.floor(p5.random() * functionNames.length)]
        attractor =
            attractorNames[p5.floor(p5.random() * attractorNames.length)]
        strangeAttractors(p5).init(attractor)
        cartel.innerHTML = ''
        cartel.innerHTML += `<p>a ${strFromVar(
            planeFunction
        )} <sup>Plane function</p>`
        cartel.innerHTML += `<p>b ${strFromVar(
            attractor
        )} <sup>Attractor</sup></p>`
        cartel.innerHTML += `<p>a ${getOperatorSymbol(choosenJoinFunc)} b</p>`
        const colorBlock = document.createElement('div')
        colorBlock.classList.add('colorBlock')
        colors = generateHslaColors(84, 42, 70, 2).map((c, index) => {
            const color = document.createElement('div')
            color.classList.add('color')
            let style = 'width: 24px; height: 24px; '
            style += `background-color: hsla(${c[0]}, ${c[1]}%, ${c[2]}%, ${c[3]}%);`
            color.setAttribute('style', style)
            colorBlock.appendChild(color)

            return p5.color(c[0], c[1], c[2], c[3])
        })
        cartel.appendChild(colorBlock)
        p5.background(0, 75, 4)
    }
    sketch.download_PNG = () => {
        const date = new Date()
        const filename =
            'Double-curve.' +
            planeFunction +
            '-' +
            choosenJoinFunc +
            '-' +
            attractor +
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
