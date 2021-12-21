import Stack from './Stack'

import SvgTracer from '../../src/js/sketch-common/svg-tracer'
const colors = ['#dbcfb0', '#bfc8ad', '#90b494', '#718f94', '#545775']
// ['#e9d758', '#297373', '#ff8552', '#e6e6e6', '#39393a']

const sketch = {
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
        const xGrid = new Stack(56)
        let size = { w: 0, h: 0 }
        let pos = { x: 0, y: 0 }

        for (let i = 0; i < xGrid.items.length; i++) {
            pos.y = 0
            size.w = xGrid.items[i] * sketch.svg.width
            const yGrid = new Stack(34)

            for (let j = 0; j < yGrid.items.length; j++) {
                size.h = yGrid.items[j] * sketch.svg.height

                sketch.svg.rect({
                    x: pos.x,
                    y: pos.y,
                    w: size.w,
                    h: size.h,
                    fill: colors[j % colors.length]
                })
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
