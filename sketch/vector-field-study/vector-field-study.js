import * as tome from 'chromotome'
import funcs from '../../src/js/sketch-common/plane-curve'

const sketch = (p5) => {
    const res = 0.05
    const scale = 0.01
    const alpha = 50
    let selectedFunc, palette, points, canvas

    const planeCurveFunctionSelector = () => {
        const funcSelector = document.createElement('select')
        const lastFunc = Object.keys(funcs).pop()
        // loop through functions in func
        Object.entries(funcs).forEach((func) => {
            // create option for each them
            const funcName = func[0].replaceAll('_', ' ')
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
        document.getElementById('windowFrame').appendChild(funcSelector)
        // change selected function when user change it
        funcSelector.addEventListener('change', (event) => {
            sketch.init_pos()
            selectedFunc = funcSelector.value
        })
    }
    sketch.init_pos = () => {
        // initialise points positions
        points = []
        for (let x = -3; x <= 3; x += res) {
            for (let y = -3; y <= 3; y += res) {
                points.push(
                    p5.createVector(
                        x + p5.random(1) * res,
                        y + p5.random(1) * res
                    )
                )
            }
        }
        // clear the canvas background
        if (palette.background) {
            p5.background(palette.background)
        } else if (palette.stroke) {
            p5.background(palette.stroke)
        } else {
            p5.background(25, 25, 25)
        }
    }
    sketch.init_sketch = () => {
        // get a random palette from chromotome
        palette = tome.get()
        sketch.init_pos()
    }

    const circle = function (theta) {
        return p5.createVector(p5.cos(theta), p5.sin(theta))
    }

    p5.setup = () => {
        //const size = sketchSize()
        //canvas = p5.createCanvas(size.w, size.h)

        canvas = p5.createCanvas(1000, 1000)
        p5.pixelDensity(window.devicePixelRatio)
        p5.stroke(0)
        planeCurveFunctionSelector()
        init_sketch()
    }

    p5.draw = () => {
        for (let p = 0; p < points.length; p++) {
            const xx = p5.map(points[p].x, -5, 5, 0, p5.width)
            const yy = p5.map(points[p].y, -5, 5, 0, p5.height)

            const n1 =
                5 * p5.map(p5.noise(points[p].x, points[p].y), 0, 1, -1, 1)
            const v1 = circle(n1)
            const v2 = funcs[selectedFunc](v1)
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
        /* sketch.init_pos()
        const size = sketchSize()
        canvas = p5.createCanvas(size.w, size.h) */
    }
    sketch.download_PNG = () => {
        const date = new Date()
        const filename =
            'Vector-field.' +
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
}

export default sketch
