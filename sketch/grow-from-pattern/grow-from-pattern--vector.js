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
    iterations: 5,
    patternNum: [3, 5, 6, 7, 9, 10, 11, 12, 13, 15],
    width: 1280, //5031,
    height: 1280, //3579,
    trigoFunc: false,
    scale: 256,
    res: 64,
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
            'height: 85vh; width: auto; background: #fff; box-shadow: 0 0.5em 1em rgba(0,0,0,0.1);'
        )
        sketch.root.appendChild(sketch.svg)
        sketch.reset()
    },
    init_points: () => {
        const g =
            sketch.patternNum[
                Math.floor(Math.random() * sketch.patternNum.length)
            ]
        sketch.points = []
        sketch.lines = []

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
        for (let p = 0; p < sketch.points.length; p++) {
            const xx = map(sketch.points[p].x, -4, 4, 0, sketch.width)
            const yy = map(sketch.points[p].y, -4, 4, 0, sketch.height)
            const n1 =
                500 *
                map(
                    simplex.noise2D(sketch.points[p].x, sketch.points[p].y),
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

            sketch.lines[p].push([xx, yy])
        }

        if (sketch.nIter < sketch.iterations) {
            requestAnimationFrame(sketch.update)
            sketch.nIter++
        } else {
            sketch.print()
        }
    },
    print: () => {
        while (sketch.svg.firstChild) {
            sketch.svg.removeChild(sketch.svg.firstChild)
        }
        for (let i = 0; i < sketch.lines.length; i++) {
            const path = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'path'
            )
            let d = `M ${sketch.lines[i][0][0]} ${sketch.lines[i][0][1]}`

            for (let j = 1; j < sketch.lines[i].length; j++) {
                d += ` L${sketch.lines[i][j][0]} ${sketch.lines[i][j][1]}`
            }
            path.setAttribute('d', d)
            sketch.svg.appendChild(path)
        }
    },
    reset: () => {
        sketch.trigoFunc = randomTrigoFunc()
        sketch.init_points()
        sketch.update()
    }
}
export default sketch
