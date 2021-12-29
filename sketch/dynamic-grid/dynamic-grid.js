import Stack from './Stack'
// import SimplexNoise from 'simplex-noise'
import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import hatch from './hatch'
// const simplex = new SimplexNoise()
const svg = new SvgTracer({
    parentElem: document.getElementById('windowFrame'),
    size: 'A4_portrait'
})
const sketch = {
    noiseScale: 10,
    noiseFrequency: 200,
    step: svg.cmToPixels(0.15),
    margin: svg.cmToPixels(2),
    // setup
    launch: () => {
        svg.init()
        sketch.inner = {
            w: svg.width - sketch.margin * 2,
            h: svg.height - sketch.margin * 2
        }
        sketch.init()
    },
    // reset value and relaunch drawing
    init: () => {
        svg.clear()
        const xGrid = new Stack(10)
        let size = { w: 0, h: 0 }
        let pos = { x: 0, y: 0 }

        for (let i = 0; i < xGrid.items.length; i++) {
            pos.y = 0
            size.w = xGrid.items[i] * sketch.inner.w
            const yGrid = new Stack(16)

            for (let j = 0; j < yGrid.items.length; j++) {
                size.h = yGrid.items[j] * sketch.inner.h

                const lines = hatch({
                    x: sketch.margin + pos.x,
                    y: sketch.margin + pos.y,
                    w: size.w,
                    h: size.h,
                    step: sketch.step
                })
                if (lines[0]) {
                    lines.forEach((points) =>
                        svg.path({
                            points: points,
                            stroke: 'black',
                            close: false,
                            fill: 'none'
                        })
                    )
                }
                pos.y += size.h
            }
            pos.x += size.w
        }
        /*
        for (let x = 0; x < size.w; x += sketch.step) {
            const r = Math.sin((x / size.w) * 2) * size.h * 0.01
            const angle =
                sketch.noiseScale *
                simplex.noise2D(
                    (pos.x + x) * sketch.noiseFrequency,
                    (pos.y + y) * sketch.noiseFrequency
                )
            points.push([
                pos.x + x + r * Math.cos(angle),
                pos.y + y + r * Math.sin(angle)
            ])
        }
        */
    },
    // export inline <svg> as SVG file
    export: () => {
        svg.export({ name: 'dynamic-grid' })
    }
}

export default sketch
