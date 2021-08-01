import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import Walker from './Walker'

const sketch = {
    iterations: 5000,
    nIter: 0,
    svg: new SvgTracer(document.getElementById('windowFrame'), 'p32x24'),
    margin: 50,
    step: 1,
    grid: { cols: false, rows: false },
    angle: Math.PI / 4,
    walkers: [],
    density: 10,
    // setup
    launch: () => {
        sketch.svg.init()
        const innerWidth = sketch.svg.width - sketch.margin * 2
        const innerHeight = sketch.svg.height - sketch.margin * 2

        sketch.grid.cols = Math.floor(innerWidth / sketch.step)
        sketch.grid.rows = Math.floor(innerHeight / sketch.step)

        for (let x = 0; x <= sketch.grid.cols / sketch.density; x++) {
            for (let y = 0; y <= sketch.grid.rows / sketch.density; y++) {
                sketch.walkers.push(
                    new Walker({
                        pos: [x * sketch.density, y * sketch.density],
                        distanceBetween: 2,
                        step: {
                            min: 1,
                            max: 5
                        },
                        maxDirectionTries: 4,
                        limit: [sketch.grid.cols, sketch.grid.rows]
                    })
                )
            }
        }
        sketch.update()
    },
    // reset value and relaunch drawing
    // compute change
    update: () => {
        sketch.nIter++
        const stoppedWalkersNum = sketch.walkers.reduce((num, walker) => {
            return num + walker.isStopped
        }, 0)
        if (
            sketch.nIter < sketch.iterations ||
            stoppedWalkersNum === sketch.walkers.length
        ) {
            for (let w = 0; w < sketch.walkers.length; w++) {
                /* const othersWalkers = [......sketch.walkers]
                othersWalkers.splice(w, 1) */
                sketch.walkers[w].walk(sketch.walkers)
            }

            requestAnimationFrame(sketch.update)
        } else {
            console.log('stoppedWalkersNum', stoppedWalkersNum)
            for (let w = 0; w < sketch.walkers.length; w++) {
                const line = sketch.walkers[w].history.map((pos) => [
                    sketch.margin + pos[0] * sketch.step,
                    sketch.margin + pos[1] * sketch.step
                ])
                sketch.svg.path({
                    points: line,
                    stroke: '#000',
                    fill: 'rgba(0,0,0,0)'
                })
            }
            console.log('Sketch done')
        }
    },
    // compute change
    // export inline <svg> as SVG file
    export: () => {
        sketch.svg.export({ name: 'sketchname' })
    }
}

export default sketch
