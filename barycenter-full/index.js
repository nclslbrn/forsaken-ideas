/// <reference path="../node_modules/@types/p5/global.d.ts" />
const containerElement = document.body
const loader = document.getElementById('p5_loading')
import style from '../src/sass/project.scss'
import p5 from "p5"

const sketch = (p) => {

    let n_triangles, rotation, frame, stopFrame, cacheCanvas, triangles

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

    const setup = () => {

        cacheCanvas = p.createCanvas(window.innerWidth, window.innerHeight)
        p.frameRate(24)
        p.smooth(0)
        p.noFill()
        p.background(0)
        frame = 0
        stopFrame = 0
        initSketch()
        p.background(0)

    }

    const draw = () => {

        frame = frameCount - stopFrame
        p.push()

        if (frame > 260) {

            p.rotate(rotation)
            rotation++
        }

        for (var t = 0; t < triangles.length; t++) {

            triangles[t].display(
                triangles[t].a,
                triangles[t].b,
                triangles[t].c,
                triangles[t].color
            )

        }
        pop()

        if (frame > 350) {

            p.saveCanvas(cacheCanvas, 'random-triangles' + frameCount, 'png')
            stopFrame = frameCount
            p.background(0)
            initSketch()

        }
    }

    const initTriangles = () => {

        for (var n_triangle = 1; n_triangle <= n_triangles; n_triangle++) {

            var color = p.round(p.random(colors.length - 1))
            var points = getRandomPoints()

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

        var points = []

        for (n_point = 0; n_point <= 3; n_point++) {

            var x_factor = p.round(p.random(0, 16))
            var y_factor = p.round(p.random(0, 9))

            points[n_point] = {
                x: x_factor * (width / 16),
                y: y_factor * (height / 9)
            }

        }

        return points
    }

    const Triangle = (a, b, c, color) => {

        this.a = a
        this.b = b
        this.c = c
        this.color = color

        this.display = function(a, b, c, color) {

            p.stroke(colorAlpha(colors[color], .5))

            var ab = {
                x: a.x - b.x,
                y: a.y - b.y
            }
            var ac = {
                x: a.x - c.x,
                y: a.y - c.y
            }

            var point_by_frame = p.max(b.x - a.x, a.x - b.x, c.x - a.x, a.x - c.x, b.x - c.x, c.x - a.x)

            for (let n = 0; n < point_by_frame; n++) {

                const r = p.random(-1, 0)
                const s = p.random(-1, 0)

                if (r + s >= -1) {

                    p.point(
                        (a.x + r * ab.x + s * ac.x),
                        (a.y + r * ab.y + s * ac.y)
                    )

                }
            }
        }
    }

    const colorAlpha = (aColor, alpha) => {
        var c = p.color(aColor)
        return p.color('rgba(' + [p.red(c), p.green(c), p.blue(c), alpha].join(',') + ')')
    }
}
const P5 = new p5(sketch, containerElement)
document.body.removeChild(loader)
/*
function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
    initSketch()
}

window.addEventListener("resize", function() {
    windowResized()
})
*/