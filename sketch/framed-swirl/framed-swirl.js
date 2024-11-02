import funcs from '../../sketch-common/plane-curve'
import strangeAttractors from '../../sketch-common/strange-attractors'
import joinVector from './joinVector'
import { generateHslaColors } from '../../sketch-common/generateHslaColors'
import Notification from '../../sketch-common/Notification'

const container = document.getElementById('windowFrame')

const sketch = (p5) => {
    const n = 3,
        x1 = -4,
        y1 = -4,
        x2 = 4,
        y2 = 4

    let y = y1,
        margin,
        step,
        drawing,
        planeFunction,
        attractor,
        canvas,
        choosenJoinFunc,
        colors,
        cartel

    // A4 150dpi canvas = p5.createCanvas(1754, 1280)
    const sketchWidth = 1200
    const sketchHeight = 1200

    // displacement functions

    const attractors = strangeAttractors().attractors

    const functionNames = Object.entries(funcs).map((func_name) => func_name[0])
    const attractorNames = Object.entries(attractors).map((attr_name) => attr_name[0])
    const { joinVectorFuncs, joinVectorFuncsNames, getOperatorSymbol } =
        joinVector(p5)
    const strFromVar = (variable) => variable.replaceAll('_', ' ').toUpperCase()

    // draw function
    const drawVariation = (x, y) => {
        const v = p5.createVector(x, y)
        for (let i = 0; i < n; i++) {
            const v2 = funcs[planeFunction](v)
            const v3 = attractors[attractor](v)
            const v4 = joinVectorFuncs[choosenJoinFunc](v2, v3)
            const fv = funcs['sinusoidal'](v4, (x2 - x1) / 2)
            const xx = p5.map(
                fv.x,
                x1,
                x2,
                margin,
                p5.width - margin
            )
            const yy = p5.map(
                fv.y,
                y1,
                y2,
                margin,
                p5.height - margin
            )

            p5.point(xx, yy)
        }
    }
    p5.setup = () => {
        margin = sketchWidth / 24
        canvas = p5.createCanvas(sketchWidth, sketchHeight)
        canvas.elt.style.aspectRatio = '1 / 1'

        p5.pixelDensity(window.devicePixelRatio)
        p5.colorMode(p5.HSL, 360, 100, 100, 100)
        step = (p5.sqrt(n) * (x2 - x1)) / p5.width
        cartel = document.createElement('div')
        cartel.id = 'cartel'
        container.appendChild(cartel)
        sketch.init_sketch()
    }
    p5.draw = () => {
        if (drawing) {
            p5.background(0, 75, 4, 0.75)

            for (let i = 0; (i < n) & drawing; i++) {
                p5.stroke(colors[i % colors.length])

                for (let x = x1; x <= x2; x += step) {
                    drawVariation(x, y)
                }
                y += step
                if (y > y2) {
                    drawing = false
                    new Notification('Drawing done', container, 'light')
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
        strangeAttractors(p5).init(attractor, () => p5.random())
        cartel.innerHTML = ''
        cartel.innerHTML += `<p>a ${strFromVar(
            planeFunction
        )} <sup>Plane function</p>`
        cartel.innerHTML += `<p>b ${strFromVar(
            attractor
        )} <sup>Attractor</sup></p>`
        cartel.innerHTML += `<p>a ${getOperatorSymbol(choosenJoinFunc)} b</p>`
        const colorBlock = document.createElement('div')
        colorBlock.id = 'colorBlocks'
        colors = generateHslaColors(60, 70, 75, 4).map(c => {
            const color = document.createElement('div')
            color.classList.add('color')
            let style = 'width: 24px; height: 24px; '
            style += `background-color: hsla(${c[0]}, ${c[1]}%, ${c[2]}%, ${c[3]}%);`
            color.setAttribute('style', style)
            colorBlock.appendChild(color)

            return p5.color(c[0], c[1], c[2], c[3])
        })
        cartel.appendChild(colorBlock)
        p5.background(0, 75, 4, 100)
    }
    sketch.download_PNG = () => {
        const date = new Date()
        const filename =
            'Framed-swirl.' +
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
