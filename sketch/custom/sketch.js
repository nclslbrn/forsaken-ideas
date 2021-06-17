import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import SimplexNoise from 'simplex-noise'

const sketch = {
    step: 8,
    margin: 20,
    points: [],
    lines: [],
    svg: new SvgTracer(document.getElementById('windowFrame'), 'a4Square'),
    seed: undefined,
    simplex: undefined,
    isDone: undefined,
    // setup
    launch: () => {
        sketch.svg.init()

        sketch.init()
    },
    // reset value and relaunch drawing
    init: () => {
        sketch.seed = Math.random() * 9999
        sketch.simplex = new SimplexNoise(sketch.seed)
        sketch.points = []
        sketch.lines = []
        for (
            let y = sketch.margin;
            y < sketch.svg.height - sketch.margin;
            y += sketch.step
        ) {
            sketch.points.push({
                x: sketch.margin,
                y: y
            })
            sketch.lines.push([])
        }
        sketch.isDone = false
        sketch.update()
    },
    // compute change
    update: () => {
        console.log('update')
        for (let i = 0; i < sketch.points.length; i++) {
            sketch.points[i].x += sketch.step
            let y = sketch.points[i].y
            y +=
                sketch.simplex.noise3D(
                    sketch.points[i].x / sketch.svg.width,
                    sketch.points[i].y / sketch.svg.height,
                    Math.sin(Math.atan2(sketch.points[i].x, sketch.points[i].y))
                ) * 2000

            if (sketch.lines[i]) {
                sketch.lines[i].push([sketch.points[i].x, y])
            }
            if (sketch.points[i].x >= sketch.svg.width - sketch.margin * 2) {
                sketch.isDone = true
            }
        }
        sketch.draw()
        sketch.nIter++

        if (!sketch.isDone) {
            requestAnimationFrame(sketch.update)
        } else {
            console.log('Sketch done')
        }
    },
    // draw svg element
    draw: () => {
        sketch.svg.clear()
        for (let i = 0; i < sketch.lines.length; i++) {
            if (sketch.lines[i].length > 1) {
                sketch.svg.path({
                    points: sketch.lines[i],
                    stroke: 'black',
                    fill: 'none',
                    close: false
                })
            }
        }
    },
    // export inline <svg> as SVG file
    export: () => {
        sketch.svg.export({ name: 'sketchname' })
    }
}

export default sketch
