import makeGrid from './makeGrid'

let grid = null
let cacheCanvas = null

const colors = [
    '#1abc9c',
    '#16a085',
    '#2ecc71',
    '#27ae60',
    '#3498db',
    '#2980b9',
    '#9b59b6',
    '#8e44ad',
    '#34495e',
    '#2c3e50',
    '#f1c40f',
    '#f39c12',
    '#e67e22',
    '#d35400',
    '#e74c3c',
    '#c0392b',
    '#ecf0f1',
    '#000000',
    '#95a5a6',
    '#7f8c8d'
]

const sketch = (p5) => {
    let triangles = []
    let frame = 0
    let stopFrame = 0
    const numTrianglePerCircle = 4
    sketch.initSketch = () => {
        triangles = []
        grid = makeGrid(
            Math.floor(p5.random(160, 220)),
            window.innerWidth,
            window.innerHeight
        )

        for (let x = 0; x < grid.cols; x++) {
            for (let y = 0; y < grid.rows; y++) {
                const _x =
                    grid.outerXMargin + grid.cellWidth / 2 + x * grid.cellWidth
                const _y =
                    grid.outerYMargin + grid.cellWidth / 2 + y * grid.cellWidth

                for (let t = 0; t < numTrianglePerCircle; t++) {
                    const points = getRandomPoints(_x, _y, grid.cellWidth / 3)

                    const color = p5.int(p5.random(1) * colors.length)

                    triangles.push({
                        a: points[0],
                        b: points[1],
                        c: points[3],
                        color: color
                    })
                }
            }
        }
        p5.background(0)
    }

    p5.setup = () => {
        cacheCanvas = p5.createCanvas(window.innerWidth, window.innerHeight)
        p5.frameRate(24)
        p5.smooth(0)
        p5.noFill()

        frame = 0
        stopFrame = 0

        sketch.initSketch()
    }

    p5.draw = () => {
        frame = p5.frameCount - stopFrame

        for (let t = 0; t < triangles.length; t++) {
            drawTrianglePoints(triangles[t])
        }

        if (frame > 350) {
            //p5.saveCanvas(cacheCanvas, 'random-triangles' + frameCount, 'png')
            stopFrame = p5.frameCount
            p5.background(0)
            sketch.initSketch()
        }
    }

    const getRandomPoints = (x, y, radius) => {
        let last_angle = 0
        const points = []

        for (let n_point = 0; n_point <= 3; n_point++) {
            const angle = Math.floor(last_angle + p5.random(0, p5.TWO_PI))
            points[n_point] = {}
            last_angle = angle

            const x_factor = p5.round(p5.random(0, 16))
            const y_factor = p5.round(p5.random(0, 9))

            points[n_point].x = Math.floor(x + p5.cos(angle) * radius)
            points[n_point].y = Math.floor(y + p5.sin(angle) * radius)
        }
        return points
    }

    const drawTrianglePoints = (triangle) => {
        const a = triangle.a
        const b = triangle.b
        const c = triangle.c
        const color = triangle.color

        const ab = {
            x: a.x - b.x,
            y: a.y - b.y
        }
        const ac = {
            x: a.x - c.x,
            y: a.y - c.y
        }

        const points_to_compare = [
            b.x - a.x,
            a.x - b.x,
            c.x - a.x,
            a.x - c.x,
            b.x - c.x,
            c.x - a.x
        ]
        const point_by_frame = p5.max(points_to_compare)

        p5.stroke(colorAlpha(colors[color], 0.5))

        for (let n = 0; n < point_by_frame; n++) {
            const r = p5.random(-1, 0)
            const s = p5.random(-1, 0)

            if (r + s >= -1) {
                p5.point(a.x + r * ab.x + s * ac.x, a.y + r * ab.y + s * ac.y)
            }
        }
    }

    const colorAlpha = (aColor, alpha) => {
        const c = p5.color(aColor)
        return p5.color(
            'rgba(' +
                [p5.red(c), p5.green(c), p5.blue(c), alpha].join(',') +
                ')'
        )
    }

    sketch.exportJPG = () => {
        const date = new Date()
        const filename =
            'Point-in-triangle.' +
            date.getFullYear() +
            '-' +
            date.getMonth() +
            '-' +
            date.getDay() +
            '_' +
            date.getHours() +
            '.' +
            date.getMinutes() +
            '.' +
            date.getSeconds() +
            '--copyright_Nicolas_Lebrun_CC-by-3.0'
        p5.saveCanvas(cacheCanvas, filename, 'jpg')
    }
}

export default sketch
