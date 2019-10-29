'use strict'
////////////////////////////////////////////////////////////
const containerElement = document.body
const loader = document.getElementById('p5_loading')
import style from '../src/sass/project.scss'
import p5 from "p5"
////////////////////////////////////////////////////////////
const colors = [
    '#1abc9c', '#16a085',
    '#2ecc71', '#27ae60',
    '#3498db', '#2980b9',
    '#9b59b6', '#8e44ad',
    '#34495e', '#2c3e50',
    '#f1c40f', '#f39c12',
    '#e67e22', '#d35400',
    '#e74c3c', '#c0392b',
    '#ecf0f1', '#000000',
    '#95a5a6', '#7f8c8d'
]

const sketch = (p5) => {

    let n_triangles, rotation, frame, stopFrame, cacheCanvas, triangles

    p5.setup = () => {

        p5.createCanvas(window.innerWidth, window.innerHeight)
        p5.frameRate(24)
        p5.smooth(0)
        p5.noFill()
        p5.background(0)

        frame = 0
        stopFrame = 0

        initSketch()
        p5.background(0)

    }

    p5.draw = () => {

        frame = p5.frameCount - stopFrame
        p5.push()

        if (frame > 260) {

            p5.rotate(rotation)
            rotation++
        }

        for (let t = 0; t < triangles.length; t++) {

            triangles[t].display(
                triangles[t].a,
                triangles[t].b,
                triangles[t].c,
                triangles[t].color
            )

        }
        p5.pop()

        if (frame > 350) {

            p5.saveCanvas(cacheCanvas, 'random-triangles' + frameCount, 'png')
            stopFrame = frameCount
            p5.background(0)
            initSketch()

        }

    }

    const initTriangles = () => {

        for (let n_triangle = 1; n_triangle <= n_triangles; n_triangle++) {

            const color = p5.int(p5.random(1) * colors.length)
            const points = getRandomPoints()

            triangles.push(
                new Triangle(
                    points[1],
                    points[2],
                    points[3],
                    color
                )
            )

        }
    }

    const initSketch = () => {

        n_triangles = 15
        rotation = 0.00001
        triangles = []

        initTriangles()
    }

    const getRandomPoints = () => {

        const points = []

        for (let n_point = 0; n_point <= 3; n_point++) {

            var x_factor = p5.round(p5.random(0, 16))
            var y_factor = p5.round(p5.random(0, 9))

            points[n_point] = {
                x: x_factor * (window.innerWidth / 16),
                y: y_factor * (window.innerHeight / 9)
            }

        }

        return points
    }

    const Triangle = (a, b, c, color) => {

        this.a = a
        this.b = b
        this.c = c
        this.color = color

        this.display = function (a, b, c, color) {

            p5.stroke(colorAlpha(colors[color], .5))

            var ab = {
                x: a.x - b.x,
                y: a.y - b.y
            }
            var ac = {
                x: a.x - c.x,
                y: a.y - c.y
            }

            var point_by_frame = p5.max(b.x - a.x, a.x - b.x, c.x - a.x, a.x - c.x, b.x - c.x, c.x - a.x)

            for (let n = 0; n < point_by_frame; n++) {

                const r = p5.random(-1, 0)
                const s = p5.random(-1, 0)

                if (r + s >= -1) {

                    p5.point(
                        (a.x + r * ab.x + s * ac.x),
                        (a.y + r * ab.y + s * ac.y)
                    )

                }
            }
        }
    }

    const colorAlpha = (aColor, alpha) => {
        var c = p5.color(aColor)
        return p5.color('rgba(' + [p5.red(c), p5.green(c), p5.blue(c), alpha].join(',') + ')')
    }
}
////////////////////////////////////////////////////

const P5 = new p5(sketch, containerElement)
document.body.removeChild(loader)
////////////////////////////////////////////////////

/*
function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
    initSketch()
}

window.addEventListener("resize", function() {
    windowResized()
})
*/