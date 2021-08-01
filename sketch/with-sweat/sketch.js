import SvgTracer from '../../src/js/sketch-common/svg-tracer'

const sketch = {
    iterations: 100,
    nIter: 0,
    svg: new SvgTracer(document.getElementById('windowFrame'), 'p32x24'),
    margin: 50,
    step: 11,
    angle: Math.PI / 4,
    // setup
    launch: () => {
        sketch.svg.init()
        sketch.init()
    },
    // reset value and relaunch drawing
    init: () => {
        const topToBottom = []
        const bottomToTop = []
        const leftToRight = []
        const rightToLeft = []

        for (
            let y = sketch.margin;
            y < sketch.svg.height - sketch.margin;
            y += sketch.step
        ) {
            topToBottom.push([sketch.svg.width - sketch.margin, y])
            bottomToTop.push([sketch.margin, sketch.svg.height - y])
        }
        for (
            let x = sketch.margin;
            x < sketch.svg.width - sketch.margin;
            x += sketch.step
        ) {
            leftToRight.push([x, sketch.margin])
            rightToLeft.push([
                sketch.svg.width - x,
                sketch.svg.height - sketch.margin
            ])
        }

        sketch.points = [
            ...leftToRight,
            ...topToBottom,
            ...rightToLeft,
            ...bottomToTop
        ]

        for (let i = 0; i < sketch.points.length; i++) {
            const start = sketch.points[i]
            const stop = sketch.points[sketch.points.length - (i + 1)]
            sketch.svg.path({ points: [start, stop], stroke: '#333' })
        }
    },
    // compute change
    // export inline <svg> as SVG file
    export: () => {
        sketch.svg.export({ name: 'sketchname' })
    }
}

export default sketch
