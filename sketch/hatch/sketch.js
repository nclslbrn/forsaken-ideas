import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import Walker from './Walker'
import Notification from '../../src/js/sketch-common/Notification'
import { randomIntBetween } from './randomBetween'
import LineOffset from './LineOffset'

const container = document.getElementById('windowFrame')
const sketch = {
    svg: new SvgTracer(container, 'p32x24'),
    margin: 50,
    cellSize: 8 * Math.ceil(Math.random() * 8),
    walkerNum: 32,
    grid: { cols: false, rows: false },
    // setup svg anf its params
    launch: () => {
        sketch.svg.init()
        const innerWidth = sketch.svg.width - sketch.margin * 2
        const innerHeight = sketch.svg.height - sketch.margin * 2

        sketch.grid.cols = Math.floor(innerWidth / sketch.cellSize)
        sketch.grid.rows = Math.floor(innerHeight / sketch.cellSize)
        sketch.init()
    },
    init: () => {
        // reset possible previous value
        sketch.walkers = []
        sketch.offset = 8

        const movingDiagonally = Math.random() > 0.5
        for (let n = 0; n < sketch.walkerNum; n++) {
            const x = randomIntBetween({ min: 0, max: sketch.grid.cols })
            const y = randomIntBetween({ min: 0, max: sketch.grid.rows })
            sketch.walkers.push(
                new Walker({
                    pos: [2 * Math.round(x / 2), 2 * Math.round(y / 2)],
                    step: {
                        min: 1,
                        max: 3
                    },
                    maxDirectionTries: 8,
                    limit: [sketch.grid.cols, sketch.grid.rows],
                    movingDiagonally: movingDiagonally
                })
            )
        }
        sketch.update()
    },
    // reset value and relaunch drawing
    // compute change
    update: () => {
        const stoppedWalkersNum = sketch.walkers.reduce((num, walker) => {
            return num + walker.isStopped
        }, 0)

        if (stoppedWalkersNum !== sketch.walkers.length) {
            sketch.walkers.forEach((walker) => walker.walk(sketch.walkers))
            sketch.draw()
            requestAnimationFrame(sketch.update)
        } else {
            console.log('stoppedWalkersNum', stoppedWalkersNum)
            sketch.draw()
            new Notification('Sketch done', container, 'light')
        }
    },
    // Compute offset line and draw them
    draw: () => {
        sketch.svg.clear()

        for (let w = 0; w < sketch.walkers.length; w++) {
            const line = sketch.walkers[w].history.map((pos) => [
                sketch.margin + pos[0] * sketch.cellSize,
                sketch.margin + pos[1] * sketch.cellSize
            ])
            if (line.length > 2) {
                var offset = new LineOffset({
                    line: line,
                    offsetCount: sketch.offset,
                    isDiagComp: sketch.walkers[w].movingDiagonally,
                    offsetWidth: sketch.cellSize / 2,
                    tracer: sketch.svg
                })
                offset.draw(w)
            }
        }
    },
    // export inline <svg> as SVG file
    export: () => {
        sketch.svg.export({ name: 'sketchname' })
    }
}

export default sketch
