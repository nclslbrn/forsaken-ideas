import Subdivision from './Subdivision'
import * as tome from 'chromotome'
import { generateHslaColors } from '../../src/js/sketch-common/generateHslaColors'

import p5 from 'p5'

const cansSize = () => {
    return (
        Math.round(
            (Math.min(window.innerWidth, window.innerHeight) * 0.8) / 2
        ) * 2
    )
}

const sketch = (p5) => {
    let numFrame = 8,
        cellNum = 8 + Math.round(Math.random() * 6),
        grid = null,
        palette = null,
        cellMargin = 0.02

    const mapX = (x) => {
        return p5.map(x, 0, 1, 0, p5.width)
    }
    const mapY = (y) => {
        return p5.map(y, 0, 1, 0, p5.height)
    }

    sketch.init = () => {
        grid = new Subdivision({
            baseSize: cellMargin,
            firstCellWidth: 1,
            firstCellHeight: 1
        })
        grid.init()
        palette = tome.get()
    }
    sketch.drawGrid = () => {
        p5.background(palette.background || 'azure')
        p5.stroke(palette.background || palette.stroke || 'azure')

        grid.cells.forEach((cell) => {
            const x = mapX(cell.x)
            const w = mapX(cell.w)
            const y = mapY(cell.y)
            const h = mapY(cell.h)
            p5.fill(palette.colors[cell.depth % palette.colors.length])
            p5.rect(x, y, w, h)
            if (cell.dir === 1) {
                const stepX = mapX(cellMargin)
                for (let dx = x + stepX; dx < x + w; dx += stepX) {
                    p5.line(dx, y, dx, y + h)
                }
            } else {
                const stepY = mapY(cellMargin)
                for (let dy = y + stepY; dy < y + h; dy += stepY) {
                    p5.line(x, dy, x + w, dy)
                }
            }

            // p5.line(x, y, x + w, y + h)
            // p5.line(x, y + h, x + w, y)
        })
    }
    p5.setup = () => {
        const side = cansSize()
        p5.createCanvas(side, side)
        p5.colorMode(p5.HSL, 360, 100, 100, 100)

        sketch.init()
        // p5.noFill()
        // p5.strokeWeight(2)
        // p5.noLoop()
    }

    p5.draw = () => {
        // compute grid
        if (grid.cells.length < cellNum && p5.frameCount % numFrame === 0) {
            grid.subdivide()
            sketch.drawGrid()
        }
    }
    p5.windowResized = () => {
        const side = cansSize()
        p5.resizeCanvas(side, side)
        sketch.drawGrid()
    }
    /*   
    p5.mousePressed = () => {
        grid.subdivide()
        p5.draw()
        console.log(grid.cells.length)
    } 
    */
}
export default sketch
