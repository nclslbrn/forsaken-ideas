import Stack from './Stack'
import SimplexNoise from 'simplex-noise'
import SvgTracer from '../../src/js/sketch-common/svg-tracer'
const colors = ['#dbcfb0', '#bfc8ad', '#90b494', '#718f94', '#545775']
// ['#e9d758', '#297373', '#ff8552', '#e6e6e6', '#39393a']
const simplex = new SimplexNoise()
const sketch = {
    step: 12,
    noiseScale: 500,
    iterations: 100,
    nIter: 0,
    svg: new SvgTracer({
        parentElem: document.getElementById('windowFrame'),
        size: 'A4_landscape'
    }),
    // setup
    launch: () => {
        sketch.svg.init()
        sketch.init()
    },
    // reset value and relaunch drawing
    init: () => {
        sketch.svg.clear()
        const xGrid = new Stack(48)
        let size = { w: 0, h: 0 }
        let pos = { x: 0, y: 0 }

        for (let i = 0; i < xGrid.items.length; i++) {
            pos.y = 0
            size.w = xGrid.items[i] * sketch.svg.width
            const yGrid = new Stack(48)

            for (let j = 0; j < yGrid.items.length; j++) {
                size.h = yGrid.items[j] * sketch.svg.height

                sketch.svg.rect({
                    x: pos.x,
                    y: pos.y,
                    w: size.w,
                    h: size.h,
                    fill: 'none',
                    stroke: 'black'
                })
                const r =
                    Math.sin(
                        (i * yGrid.items.length + j) /
                            (xGrid.items.length * yGrid.items.length)
                    ) * 12
                const angle =
                    Math.PI *
                    simplex.noise2D(
                        pos.x * sketch.noiseScale,
                        pos.y * sketch.noiseScale
                    )

                for (let y = 0; y < size.h; y += sketch.step) {
                    sketch.svg.path({
                        points: [
                            [
                                pos.x + r * Math.cos(Math.PI + angle),
                                pos.y + y + r * Math.sin(Math.PI + angle)
                            ],
                            [
                                pos.x + size.w + r * Math.cos(angle),
                                pos.y + y + r * Math.sin(angle)
                            ]
                        ],
                        stroke: 'black'
                    })
                }

                pos.y += size.h
            }
            pos.x += size.w
        }
    },
    // export inline <svg> as SVG file
    export: () => {
        sketch.svg.export({ name: 'dynamic-grid' })
    }
}

export default sketch
