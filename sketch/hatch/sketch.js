import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import Walker from './Walker'
import Notification from '../../src/js/sketch-common/Notification'
import { randomIntBetween } from './randomBetween'

const container = document.getElementById('windowFrame')
const sketch = {
    iterations: 2000,
    svg: new SvgTracer(container, 'p32x24'),
    margin: 50,
    cellSize: 16,
    walkerNum: 36,
    grid: { cols: false, rows: false },
    // setup
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
        sketch.nIter = 0
        // const movingDiagonally = Math.random() > 0.5
        for (let n = 0; n < sketch.walkerNum; n++) {
            const x = randomIntBetween({ min: 0, max: sketch.grid.cols })
            const y = randomIntBetween({ min: 0, max: sketch.grid.rows })
            sketch.walkers.push(
                new Walker({
                    pos: [x, y],
                    minDistanceBetween: 1,
                    step: {
                        min: 1,
                        max: 6
                    },
                    maxDirectionTries: 36,
                    limit: [sketch.grid.cols, sketch.grid.rows],
                    movingDiagonally: false
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

        if (
            sketch.nIter < sketch.iterations &&
            stoppedWalkersNum !== sketch.walkers.length
        ) {
            for (let w = 0; w < sketch.walkers.length; w++) {
                // const othersWalkers = [...sketch.walkers]
                // othersWalkers.splice(w, 1)
                sketch.walkers[w].walk(sketch.walkers)
            }
            sketch.svg.clear()
            sketch.draw()
            //console.log(`Iteration ${sketch.nIter}/${sketch.iterations}`)
            sketch.nIter++
            requestAnimationFrame(sketch.update)
        } else {
            console.log('stoppedWalkersNum', stoppedWalkersNum)
            //sketch.walkers.forEach((w) => console.log(w.history))
            sketch.svg.clear()
            sketch.draw()
            new Notification('Sketch done', container, 'light')
        }
    },
    draw: () => {
        for (let w = 0; w < sketch.walkers.length; w++) {
            const line = sketch.walkers[w].history.map((pos) => [
                sketch.margin + pos[0] * sketch.cellSize,
                sketch.margin + pos[1] * sketch.cellSize
            ])
            sketch.svg.path({
                name: 'w-' + w,
                points: line,
                stroke: '#000',
                fill: 'rgba(0,0,0,0)',
                strokeWidth: ~~sketch.cellSize / 2
            })
        }
    },
    // compute change
    // export inline <svg> as SVG file
    export: () => {
        sketch.svg.export({ name: 'sketchname' })
    }
}

export default sketch
