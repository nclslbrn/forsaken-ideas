import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import Walker from './Walker'
import Notification from '../../src/js/sketch-common/Notification'
import { randomIntBetween } from './randomBetween'
import LineOffset from './LineOffset'

const container = document.getElementById('windowFrame')
const sketch = {
    svg: new SvgTracer(container, 'p32x24'),
    margin: { x: 50, y: 50 },
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
        const innerWidth = sketch.svg.width - sketch.margin.x * 2
        const innerHeight = sketch.svg.height - sketch.margin.y * 2

        sketch.walkers = []
        sketch.offset = 8
        sketch.cellSize = movingDiagonally ? 22 : 28
        sketch.walkerNum = movingDiagonally ? 60 : 50

        sketch.grid.cols = Math.floor(innerWidth / sketch.cellSize)
        sketch.grid.rows = Math.floor(innerHeight / sketch.cellSize)
        sketch.margin.x += (innerWidth % sketch.cellSize) / 2
        sketch.margin.y += (innerHeight % sketch.cellSize) / 2
        sketch.svg.clearGroups()

        let initializedWalkerNum = 0

        while (initializedWalkerNum < sketch.walkerNum) {
            let slotIsAlreadyTaken = false
            const x =
                2 *
                Math.round(
                    randomIntBetween({ min: 0, max: sketch.grid.cols }) / 2
                )
            const y =
                2 *
                Math.round(
                    randomIntBetween({ min: 0, max: sketch.grid.rows }) / 2
                )

            sketch.walkers.forEach((walker) => {
                if (walker.pos[0] === x && walker.pos[1] === y) {
                    slotIsAlreadyTaken = true
                }
            })
            if (!slotIsAlreadyTaken) {
                sketch.walkers.push(
                    new Walker({
                        pos: [x, y],
                        step: {
                            min: 1,
                            max: 6
                        },
                        maxDirectionTries: 16,
                        limit: [sketch.grid.cols, sketch.grid.rows],
                        movingDiagonally: movingDiagonally
                    })
                )
                initializedWalkerNum++
            }
        }
        sketch.update()
    },
    // reset value and relaunch drawing
    // compute change
    update: () => {
        let stoppedWalkersNum = 0
        for (let w = 0; w < sketch.walkers.length; w++) {
            sketch.walkers[w].walk(sketch.walkers)
            if (sketch.walkers[w].isStuck()) {
                stoppedWalkersNum++
            }
        }

        if (stoppedWalkersNum !== sketch.walkerNum) {
            sketch.draw(false)
            requestAnimationFrame(sketch.update)
        } else {
            sketch.draw(true)
            new Notification('Sketch done', container, 'light')
        }
    },
    // Compute offset line and draw them
    draw: (isWalkersStopped = false) => {
        sketch.svg.clearGroups()

        for (let w = 0; w < sketch.walkers.length; w++) {
            const line = sketch.walkers[w].history.map((pos) => [
                sketch.margin.x + pos[0] * sketch.cellSize,
                sketch.margin.y + pos[1] * sketch.cellSize
            ])
            if (line.length > 2) {
                //sketch.svg.circle({})
                const offset = new LineOffset({
                    line: line,
                    offsetCount: sketch.offset,
                    isDiagComp: sketch.walkers[w].movingDiagonally,
                    offsetWidth:
                        sketch.cellSize *
                        (sketch.walkers[w].movingDiagonally ? 2 : 1.35),
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
