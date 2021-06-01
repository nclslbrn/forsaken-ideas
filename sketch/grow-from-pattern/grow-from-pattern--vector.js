import SimplexNoise from 'simplex-noise'
import funcs from '../../src/js/sketch-common/plane-curve'

const simplex = new SimplexNoise()
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
    iterations: 150,
    patternNum: [3, 5, 6, 7, 9, 10, 11, 12, 13, 15],
    width: 5031,
    height: 3579,
    trigoFunc: false,
    scale: 512,
    res: 32,
    points: [],
    lines: [],
    root: document.getElementById('windowFrame'),
    svg: document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
    requestId: false,
    init: () => {
        sketch.svg.setAttribute('version', '1.1')
        sketch.svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
        sketch.svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
        sketch.svg.setAttribute('width', sketch.width)
        sketch.svg.setAttribute('height', sketch.height)
        sketch.svg.setAttribute(
            'viewBox',
            `0 0 ${sketch.width} ${sketch.height}`
        )
        sketch.svg.setAttribute(
            'style',
            'height: 85vh; width: auto; box-shadow: 0 0.5em 1em rgba(0,0,0,0.1);'
        )
        sketch.root.appendChild(sketch.svg)
        //window.requestAnimationFrame(sketch.update)
    },
    init_points: () => {
        const g =
            sketch.patternNum[
                Math.floor(Math.random() * sketch.patternNum.length)
            ]
        sketch.points = sketch.lines = []
        for (let x = 0; x <= sketch.width; x += sketch.scale) {
            for (let y = 0; y <= sketch.height; y += sketch.scale) {
                if ((x ^ y) % g) {
                    for (let dx = 0; dx <= sketch.scale; dx += sketch.res) {
                        for (let dy = 0; dy <= sketch.scale; dy += sketch.res) {
                            sketch.points.push({
                                x: ((x + dx) / sketch.width) * 6 - 3,
                                y: ((y + dy) / sketch.height) * 6 - 3
                            })
                        }
                    }
                }
            }
        }
        for (let i = 0; i < sketch.points.length; i++) sketch.lines.push([])
    },
    update: () => {
        /*    for (let p = 0; p < points.length; p++) {
            const xx = map(points[p].x, -4, 4, 0, sketch.width)
            const yy = map(points[p].y, -4, 4, 0, sketch.height)
            const n1 =
                500 *
                map(simplex.noise2D(points[p].x, points[p].y), 0, 1, -1, 1)
            const v1 = circle(n1)
            const v2 = funcs[sketch.trigoFunc](v1)
            const v = funcs['sinusoidal'](v2)

            points[p].x += scale * v.x
            points[p].y += scale * v.y
        }
        if (sketch.nIter < sketch.iterations) {
            requestAnimationFrame(sketch.update)
        } */
    },
    print: () => {},
    reset: () => {
        sketch.trigoFunc = randomTrigoFunc()
        sketch.init_points()
    }
}
export default sketch
