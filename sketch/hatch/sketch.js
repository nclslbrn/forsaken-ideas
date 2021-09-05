import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import Walker from './Walker'
import Notification from '../../src/js/sketch-common/Notification'
import { randomIntBetween } from './randomBetween'
import LineOffset from './LineOffset'

const container = document.getElementById('windowFrame')
const sketch = {
    svg: new SvgTracer(container, 'p32x24'),
    margin: 50,
    walkerNum: 64,
    grid: { cols: false, rows: false },
    // setup svg anf its params
    launch: () => {
        sketch.svg.init()
        sketch.svg.group({
            name: 'tomato',
            stroke: 'tomato',
            fill: 'rgba(0,0,0,0)'
        })

        sketch.svg.group({
            name: 'steelblue',
            stroke: 'steelblue',
            fill: 'rgba(0,0,0,0)'
        })
        sketch.init()
    },
    init: () => {
        // reset possible previous value
        const movingDiagonally = Math.random() > 0.5
        const innerWidth = sketch.svg.width - sketch.margin * 2
        const innerHeight = sketch.svg.height - sketch.margin * 2

        sketch.walkers = []
        sketch.offset = 8
        sketch.cellSize = movingDiagonally ? 22 : 26
        sketch.grid.cols = Math.floor(innerWidth / sketch.cellSize)
        sketch.grid.rows = Math.floor(innerHeight / sketch.cellSize)

        sketch.svg.clearGroups()

        for (let n = 0; n < sketch.walkerNum; n++) {
            const x = randomIntBetween({ min: 0, max: sketch.grid.cols })
            const y = randomIntBetween({ min: 0, max: sketch.grid.rows })
            sketch.walkers.push(
                new Walker({
                    pos: [2 * Math.round(x / 2), 2 * Math.round(y / 2)],
                    step: {
                        min: 1,
                        max: 6
                    },
                    maxDirectionTries: 4,
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
        sketch.svg.clearGroups()

        for (let w = 0; w < sketch.walkers.length; w++) {
            const line = sketch.walkers[w].history.map((pos) => [
                sketch.margin + pos[0] * sketch.cellSize,
                sketch.margin + pos[1] * sketch.cellSize
            ])
            if (line.length > 2) {
                sketch.svg.circle({})
                const offset = new LineOffset({
                    line: line,
                    offsetCount: sketch.offset,
                    isDiagComp: sketch.walkers[w].movingDiagonally,
                    offsetWidth: sketch.cellSize,
                    tracer: sketch.svg
                })
                const offsetLines = offset.getOffsets(w)
                offsetLines.lines.forEach((line) =>
                    sketch.svg.path({
                        points: line,
                        group: offsetLines.color
                    })
                )
            }
        }
    },
    // export inline <svg> as SVG file
    export: () => {
        sketch.svg.export({ name: 'hatch' })
    }
}

export default sketch
