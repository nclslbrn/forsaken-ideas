import planeCurveFuncs from '../../src/js/sketch-common/plane-curve'
import joinVector from './joinVector'
import { generateHslaColors } from './generateHslaColors'

const sketch = (p5) => {
    const n = 3
    const margin = 120
    const alpha = 25
    const x1 = -3
    const y1 = -3
    const x2 = 3
    const y2 = 3
    let y = y1
    let step,
        drawing,
        planeFunctionOne,
        planeFunctionTwo,
        canvas,
        choosenJoinFunc,
        colors,
        cartel

    // A4 150dpi canvas = p5.createCanvas(1754, 1280)
    /*
    const sketchWidth = window.innerWidth > 800 ? 800 : window.innerWidth
    const sketchHeight = window.innerHeight > 800 ? 800 : window.innerHeight
    */
    const sketchWidth = 1280
    const sketchHeight = 1500

    // displacement functions
    const funcs = planeCurveFuncs(p5)
    const functionNames = Object.entries(funcs).map((func_name) => {
        return func_name[0]
    })
    const { joinVectorFuncs, joinVectorFuncsNames } = joinVector(p5)

    // draw function
    const drawVariation = (x, y) => {
        const v = p5.createVector(x, y)
        for (let i = 0; i < n; i++) {
            const v2 = funcs[planeFunctionOne](v)
            const v3 = funcs[planeFunctionTwo](v)
            const v4 = joinVectorFuncs[choosenJoinFunc](v2, v3)
            const fv = funcs['sinusoidal'](v4, (x2 - x1) / 2)
            const xx = p5.map(
                fv.x + 0.003 * p5.randomGaussian(),
                x1,
                x2,
                margin,
                p5.width - margin
            )
            const yy = p5.map(
                fv.y + 0.003 * p5.randomGaussian(),
                y1,
                y2,
                margin,
                p5.height - margin
            )
            p5.point(xx, yy)
        }
    }
    p5.setup = () => {
        canvas = p5.createCanvas(sketchWidth, sketchHeight)
        canvas.elt.setAttribute(
            'style',
            'max-width:' +
                sketchWidth / 2 +
                'px; max-height:' +
                sketchHeight / 2 +
                'px'
        )
        //p5.strokeWeight(0.5)
        p5.pixelDensity(window.devicePixelRatio)
        p5.colorMode(p5.HSL, 360, 100, 100, 100)
        step = (p5.sqrt(n) * (x2 - x1)) / (2.526 * p5.width)
        cartel = document.createElement('div')
        cartel.id = 'cartel'
        document.body.appendChild(cartel)
        init_sketch()
    }
    p5.draw = () => {
        if (drawing) {
            for (let i = 0; (i < 20) & drawing; i++) {
                for (let x = x1; x <= x2; x += step) {
                    const color = p5.lerpColor(
                        colors[0],
                        colors[1],
                        (x * y) / 9
                    )
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
        window.attractors = {
            a: p5.random(-2, 2),
            b: p5.random(-2, 2),
            c: p5.random(-2, 2),
            d: p5.random(-2, 2)
        }
        choosenJoinFunc =
            joinVectorFuncsNames[
                p5.floor(p5.random() * joinVectorFuncsNames.length)
            ]
        planeFunctionOne =
            functionNames[p5.floor(p5.random() * functionNames.length)]
        planeFunctionTwo =
            functionNames[p5.floor(p5.random() * functionNames.length)]
        cartel.innerHTML = ''
        const vectorInfo = document.createElement('p')
        vectorInfo.innerHTML = (
            planeFunctionOne +
            ' & ' +
            planeFunctionTwo +
            ' (' +
            choosenJoinFunc +
            ')'
        )
            .replace('_', ' ')
            .toUpperCase()
        cartel.appendChild(vectorInfo)
        const colorBlock = document.createElement('div')
        colorBlock.classList.add('colorBlock')
        colors = generateHslaColors(80, 60, 25, 4).map((c, index) => {
            // Skip the third color to get a gap between shape and backgroud
            if (index !== 2) {
                const color = document.createElement('div')
                color.classList.add('color')
                let style = 'width: 24px; height: 24px; '
                style +=
                    'background-color: hsl(' +
                    c[0] +
                    ', ' +
                    c[1] +
                    '%, ' +
                    c[2] +
                    '%);'
                color.setAttribute('style', style)
                colorBlock.appendChild(color)
            }
            return p5.color(c[0], c[1], c[2], c[3])
        })
        cartel.appendChild(colorBlock)
        colors[3].setAlpha(255)
        p5.background(colors[3])
    }
    sketch.download_PNG = () => {
        const date = new Date()
        const filename =
            'Double-curve.' +
            planeFunctionOne +
            '-' +
            choosenJoinFunc +
            '-' +
            planeFunctionTwo +
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
