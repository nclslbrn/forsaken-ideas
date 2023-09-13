import { createNoise2D } from 'simplex-noise'
import funcs from '../../sketch-common/plane-curve'
import Notification from '../../sketch-common/Notification'
import SvgTracer from '../../sketch-common/svg-tracer'

const simplex = createNoise2D()
const randomTrigoFunc = () => {
    const funcsName = []
    Object.entries(funcs).forEach((func) => {
        funcsName.push(func[0])
    })
    return funcsName[Math.floor(Math.random() * funcsName.length)]
}
const map = (n, start1, stop1, start2, stop2) => {
    return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2
}
const circle = (theta) => {
    return { x: Math.cos(theta), y: Math.sin(theta) }
}

// Main sketch object
const sketch = {
    nIter: 0,
    iterations: 30, // print version 40
    patternNum: [3, 5, 6, 7, 9, 10, 11, 12, 13, 15],
    trigoFunc: false,
    scale: 0.007,
    step: 72, // print version 96
    res: 12, // print version 6
    points: [],
    lines: [],
    root: document.getElementById('windowFrame'),
    svg: null,
    init: () => {
        sketch.svg =  new SvgTracer({
            parentElem: sketch.root,
            size: 'A3_portrait',
            dpi: 72
        })
        sketch.svg.init()
        sketch.reset()
    },
    init_points: () => {
        const g =
            sketch.patternNum[
            Math.floor(Math.random() * sketch.patternNum.length)
            ]
        sketch.points = []
        sketch.lines = []
        sketch.nIter = 0

        for (let x = 0; x <= sketch.svg.width; x += sketch.step) {
            for (let y = 0; y <= sketch.svg.height; y += sketch.step) {
                if ((x ^ y) % g) {
                    for (let dx = 0; dx <= sketch.step; dx += sketch.res) {
                        for (let dy = 0; dy <= sketch.step; dy += sketch.res) {
                            sketch.points.push({
                                x: ((x + dx) / sketch.svg.width) * 6 - 3,
                                y: ((y + dy) / sketch.svg.height) * 6 - 3
                            })
                            sketch.lines.push([])
                        }
                    }
                }
            }
        }
    },
    update: () => {
        for (let p = 0; p < sketch.points.length; p++) {
            const xx = map(sketch.points[p].x, -4, 4, 0, sketch.svg.width)
            const yy = map(sketch.points[p].y, -4, 4, 0, sketch.svg.height)
            const n1 =
                20 *
                map(
                    simplex(sketch.points[p].x, sketch.points[p].y),
                    0,
                    1,
                    -1,
                    1
                )
            const v1 = circle(n1)
            const v2 = funcs[sketch.trigoFunc](v1)
            const v = funcs['sinusoidal'](v2)

            sketch.points[p].x += sketch.scale * v.x
            sketch.points[p].y += sketch.scale * v.y
            
            if (!isNaN(xx) && !isNaN(yy)) {
                sketch.lines[p].push([xx, yy])
            }
        }
        sketch.print()

        if (sketch.nIter < sketch.iterations) {
            requestAnimationFrame(sketch.update)
            sketch.nIter++
        } else {
            new Notification('Drawing done', sketch.root, 'light')
            console.log('Done')
            sketch.print()
        }
    },
    print: () => {
        sketch.svg.clear()
        for (let i = 0; i < sketch.lines.length; i++) {
            sketch.svg.path({
                points: sketch.lines[i],
                stroke: "#333",
                fill: 'none',
                close: false
            })
        }
    },
    reset: () => {
        sketch.trigoFunc = randomTrigoFunc()
        sketch.init_points()
        sketch.update()
    },
    export: () => sketch.svg.export({ name: 'Grow-from-pattern' })
    
}
export default sketch
