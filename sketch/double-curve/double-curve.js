import planeCurveFuncs from '../../src/js/sketch-common/plane-function'

const sketch = (p5) => {
    const n = 3
    const x1 = -3
    const y1 = -3
    const x2 = 3
    const y2 = 3
    let y = y1
    let step
    let drawing
    let planeFunctionOne, planeFunctionTwo
    window.attractors = {
        a: p5.random(-2, 2),
        b: p5.random(-2, 2),
        c: p5.random(-2, 2),
        d: p5.random(-2, 2)
    }
    // displacement functions
    const funcs = planeCurveFuncs(p5)
    const functionNames = []
    Object.entries(funcs).forEach((func_name) => {
        functionNames.push(func_name[0])
    })

    const randomPlaneFunctions = () => {
        planeFunctionOne =
            functionNames[p5.floor(p5.random() * functionNames.length)]
        planeFunctionTwo =
            functionNames[p5.floor(p5.random() * functionNames.length)]

        console.log(planeFunctionOne, planeFunctionTwo)
    }
    const init = () => {
        drawing = true
        y = y1
        randomPlaneFunctions()
        p5.background(255)
    }
    // draw function
    const drawVariation = (x, y) => {
        let v = p5.createVector(x, y)
        for (let i = 0; i < n; i++) {
            v = funcs[planeFunctionOne](v)
            v = funcs[planeFunctionTwo](v)
            v = funcs['sinusoidal'](v, (x2 - x1) / 2)
            const xx = p5.map(
                v.x + 0.003 * p5.randomGaussian(),
                x1,
                x2,
                20,
                p5.width - 20
            )
            const yy = p5.map(
                v.y + 0.003 * p5.randomGaussian(),
                y1,
                y2,
                20,
                p5.height - 20
            )
            p5.point(xx, yy)
        }
    }
    p5.setup = () => {
        p5.createCanvas(800, 800)
        p5.strokeWeight(0.5)
        p5.stroke(0, 25)
        step = (p5.sqrt(n) * (x2 - x1)) / (2 * p5.width)
        init()
    }
    p5.draw = () => {
        if (drawing) {
            for (let i = 0; (i < 20) & drawing; i++) {
                for (let x = x1; x <= x2; x += step) {
                    drawVariation(x, y)
                }
                y += step
                if (y > y2) {
                    drawing = false
                    console.log('done')
                }
            }
        }
    }
    p5.mousePressed = () => {
        init()
    }
    p5.windowResized = () => {
        p5.resizeCanvas(800, 800)
    }
}
export default sketch
