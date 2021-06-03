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

// Value from Inkscape (document properties)
const size = {
    a3: { w: 1587.40157, h: 1122.51969 },
    a4: { w: 1122.51969, h: 793.70079 }
}

// Main sketch object
const sketch = {
    nIter: 0,
    iterations: 40,
    patternNum: [3, 5, 6, 7, 9, 10, 11, 12, 13, 15],
    size: size.a4,
    trigoFunc: false,
    scale: 0.001,
    step: 96,
    res: 6,
    points: [],
    lines: [],
    root: document.getElementById('windowFrame'),
    svg: document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
    init: () => {
        sketch.svg.setAttribute('version', '1.1')
        sketch.svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
        sketch.svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
        sketch.svg.setAttribute('width', sketch.size.w)
        sketch.svg.setAttribute('height', sketch.size.h)
        sketch.svg.setAttribute(
            'viewBox',
            `0 0 ${sketch.size.w} ${sketch.size.h}`
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

        for (let x = 0; x <= sketch.size.w; x += sketch.step) {
            for (let y = 0; y <= sketch.size.h; y += sketch.step) {
                if ((x ^ y) % g) {
                    for (let dx = 0; dx <= sketch.step; dx += sketch.res) {
                        for (let dy = 0; dy <= sketch.step; dy += sketch.res) {
                            sketch.points.push({
                                x: ((x + dx) / sketch.size.w) * 6 - 3,
                                y: ((y + dy) / sketch.size.h) * 6 - 3
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
            const xx = map(sketch.points[p].x, -4, 4, 0, sketch.size.w)
            const yy = map(sketch.points[p].y, -4, 4, 0, sketch.size.h)
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
        sketch.print()

        if (sketch.nIter < sketch.iterations) {
            requestAnimationFrame(sketch.update)
            sketch.nIter++
        } else {
            sketch.notify('Done')
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
            path.setAttribute('fill', 'none')
            path.setAttribute('stroke', '#333')
            sketch.svg.appendChild(path)
        }
    },
    notify: (message) => {
        const p = document.createElement('p')
        p.setAttribute('style', 'padding: 1em;')
        p.innerHTML = message
        sketch.root.appendChild(p)
        console.log(message)
        window.setTimeout(() => {
            sketch.root.removeChild(p)
        }, 5000)
    },
    reset: () => {
        sketch.trigoFunc = randomTrigoFunc()
        sketch.init_points()
        sketch.update()
    },
    export: () => {
        const date = new Date(),
            Y = date.getFullYear(),
            m = date.getMonth(),
            d = date.getDay(),
            H = date.getHours(),
            i = date.getMinutes(),
            filename = `Grow-from-pattern.${Y}-${m}-${d}_${H}.${i}.svg`,
            content = new Blob([sketch.root.innerHTML], {
                type: 'text/plain'
            })

        let svgFile = null
        if (svgFile !== null) {
            window.URL.revokeObjectURL(svgFile)
        }
        svgFile = window.URL.createObjectURL(content)

        const link = document.createElement('a')
        link.href = svgFile
        link.download = filename
        link.click()
    }
}
export default sketch
