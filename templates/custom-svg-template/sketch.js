import SvgTracer from '../../src/js/sketch-common/svg-tracer'

const sketch = {
    iterations: 100,
    nIter: 0,
    svg: new SvgTracer({
        parentElem: document.getElementById('windowFrame'),
        size: 'A4Square'
    }),
    // setup
    launch: () => {
        sketch.svg.init()
        sketch.init()
    },
    // reset value and relaunch drawing
    init: () => {
        sketch.update()
    },
    // compute change
    update: () => {
        sketch.nIter++
        if (sketch.nIter < sketch.iterations) {
            requestAnimationFrame(sketch.update)
        } else {
            console.log('Sketch done')
        }
    },
    // export inline <svg> as SVG file
    export: () => {
        sketch.svg.export({ name: 'sketchname' })
    }
}

export default sketch
