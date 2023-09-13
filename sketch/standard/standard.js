import Subdivision from '../../sketch-common/Subdivision'
import Notification from '../../sketch-common/Notification'
import * as tome from 'chromotome'

const sketch = (p5) => {
    let numFrame = 4,
        cellNum = 6 + Math.round(Math.random() * 6),
        grid = null,
        palette = null,
        cellMargin = 0.02,
        comp = {}

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
        comp = {
            background: palette.background || 'azure',
            squares: []
        }
    }
    sketch.drawGrid = () => {
        p5.background(palette.background || 'azure')
        p5.stroke(palette.background || palette.stroke || 'azure')
        comp.squares = []
        grid.cells.forEach((cell) => {
            const x = Math.round(mapX(cell.x))
            const w = Math.round(mapX(cell.w))
            const y = Math.round(mapY(cell.y))
            const h = Math.round(mapY(cell.h))
            p5.fill(palette.colors[cell.depth % palette.colors.length])
            p5.rect(x, y, w, h)

            comp.squares.push({
                x, y, w, c: palette.colors[cell.depth % palette.colors.length]
            })
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
        })
    }
    sketch.getComp = (container) => {
        const style = 'white-space: break-spaces; font-size: 12px; max-width: 320px;'
        new Notification(`<pre style="${style}">${JSON.stringify(comp)}</pre>`, container, 'light', false)
    }

    sketch.export_JPG = () => p5.save('Standard')

    p5.setup = () => {
        p5.createCanvas(1200, 1200)
        sketch.init()
    }

    p5.draw = () => {
        // compute grid
        if (grid.cells.length < cellNum && p5.frameCount % numFrame === 0) {
            grid.subdivide()
            sketch.drawGrid()
        }
    }
}
export default sketch
