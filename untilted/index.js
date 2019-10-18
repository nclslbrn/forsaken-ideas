/// <reference path="../node_modules/@types/p5/global.d.ts" />
const containerElement = document.body
const loader = document.getElementById('p5_loading')
import style from '../src/sass/project.scss'
import p5 from "p5"

const sketch = (p) => {

    const cellSize = 32
    const cols = window.innerWidth / cellSize
    const rows = window.innerHeight / cellSize
    let rects = []

    p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight)
        p.background(10, 20, 180)
        p.noLoop()
        p.stroke(255)
        p.noFill()

        for (var x = 0; x < cols; x++) {
            for (var y = 0; y < rows; y++) {
                rects.push({
                    x: x,
                    y: y
                })
            }
        }
    }
    p.draw = () => {

        for (const rect in rects) {
            p.rect(
                rects[rect].x * cellSize,
                rects[rect].y * cellSize,
                cellSize,
                cellSize
            )
        }
    }
}

const P5 = new p5(sketch, containerElement)
document.body.removeChild(loader)