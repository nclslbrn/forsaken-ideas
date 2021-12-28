import Stack from './Stack'
// import SimplexNoise from 'simplex-noise'
import SvgTracer from '../../src/js/sketch-common/svg-tracer'
import hatch from './hatch'

const colors = ['#dbcfb0', '#bfc8ad', '#90b494', '#718f94', '#545775']
// ['#e9d758', '#297373', '#ff8552', '#e6e6e6', '#39393a']
// const simplex = new SimplexNoise()
const svg = new SvgTracer({
    parentElem: document.getElementById('windowFrame'),
    size: 'A4_landscape'
})
const sketch = {
    noiseScale: 10,
    noiseFrequency: 200,
    step: svg.cmToPixels(0.2),
    // setup
    launch: () => {
        svg.init()
        sketch.init()
    },
    // reset value and relaunch drawing
    init: () => {
        svg.clear()
        const xGrid = new Stack(Math.ceil(Math.random() * 16))
        let size = { w: 0, h: 0 }
        let pos = { x: 0, y: 0 }

        for (let i = 0; i < xGrid.items.length; i++) {
            pos.y = 0
            size.w = xGrid.items[i] * svg.width
            const yGrid = new Stack(Math.ceil(Math.random() * 12))

            for (let j = 0; j < yGrid.items.length; j++) {
                size.h = yGrid.items[j] * svg.height
                /*  svg.rect({
                    x: pos.x,
                    y: pos.y,
                    w: size.w,
                    h: size.h,
                    fill: colors[j % colors.length],
                    stroke: 'none'
                }) */
                const lines = hatch({
                    x: pos.x,
                    y: pos.y,
                    w: size.w,
                    h: size.h,
                    step: sketch.step
                })
                if (lines[0]) {
                    lines.forEach((points) =>
                        svg.path({
                            points: points,
                            stroke: 'black',
                            //strokeWidth: 2,
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
