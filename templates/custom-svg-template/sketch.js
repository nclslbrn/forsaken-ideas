import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import exportSVG from '../../src/js/sketch-common/exportSVG'

const sketch = {
    iterations: 100,
    nIter: 0,
    svg: new SvgTracer(document.getElementById('windowFrame'), 'a4Square'),
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
        exportSVG(sketch.svg.parentElem.innerHTML, 'sketchname')
    }
}

export default sketch
