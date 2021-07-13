import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import SimplexNoise from 'simplex-noise'
import ease from '../../src/js/sketch-common/ease'
import isPointInsidePolygon from './isPointInsidePolygon'
const sketchSize = Math.min(window.innerWidth, window.innerHeight) * 0.75
const sketch = {
    step: 5,
    margin: 50,
    points: [],
    noiseFrequency: 105,
    noiseAmplitude: 40,
    lines: [],
    svg: new SvgTracer(document.getElementById('windowFrame'), {
        w: sketchSize,
        h: sketchSize
    }),
    sides: [2 / 3, 2 / 4, 2 / 5, 2 / 6],
    seed: undefined,
    simplex: undefined,
    isDone: undefined,
    side: undefined,
    // triangle square pentagone hexagon
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
        sketch.side =
            sketch.sides[Math.floor(sketch.sides.length * Math.random())]
        sketch.isDone = false
        sketch.update()
    },
    // compute change
    update: () => {
        const radius = sketchSize * 0.35
        const center = { x: sketch.svg.width / 2, y: sketch.svg.height / 2 }
        const polygon = []

        const rot = Math.PI * sketch.side
        for (let theta = 0; theta < Math.PI * 2; theta += rot) {
            const r =
                radius *
                Math.min(
                    1 / Math.abs(Math.cos(theta)),
                    1 / Math.abs(Math.sin(theta))
                )
            polygon.push({
                x: center.x + r * Math.cos(theta),
                y: center.y + r * Math.sin(theta)
            })
        }

        for (let i = 0; i < sketch.points.length; i++) {
            let amplitude = 0
            let dist = sketch.svg.width
            let _d = 1.5

            if (isPointInsidePolygon(sketch.points[i], polygon)) {
                for (let j = 0; j < polygon.length; j++) {
                    let pointToJ = Math.abs(
                        Math.sqrt(
                            Math.pow(polygon[j].x - sketch.points[i].x, 2) +
                                Math.pow(polygon[j].y - sketch.points[i].y, 2)
                        )
                    )

                    if (pointToJ < dist) dist = pointToJ
                }
                _d = 1 - dist / (radius * 4)
                amplitude = ease(_d) * sketch.noiseAmplitude
            }

            sketch.points[i].x += sketch.step
            let x = sketch.points[i].x
            let y = sketch.points[i].y
            const noise = sketch.simplex.noise3D(
                sketch.points[i].x / (sketch.noiseFrequency * (_d * 2)),
                sketch.points[i].y / (sketch.noiseFrequency * (_d * 2)),
                Math.sin(_d) / sketch.noiseFrequency
            )

            x += Math.cos(noise) * amplitude
            y += Math.sin(noise) * amplitude

            if (sketch.lines[i]) {
                sketch.lines[i].push([x, y])
            }
            if (sketch.points[i].x >= sketch.svg.width - sketch.margin) {
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
