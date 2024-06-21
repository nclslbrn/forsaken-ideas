import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { SYSTEM, pickRandom } from '@thi.ng/random'
//import { downloadCanvas, canvasRecorder } from '@thi.ng/dl-asset'
import { downloadCanvas } from '@thi.ng/dl-asset'
import { group, text, rect } from '@thi.ng/geom'
import { draw } from '@thi.ng/hiccup-canvas'
import { canvas } from '@thi.ng/hiccup-html'
import { adaptDPI } from '@thi.ng/canvas'
import { getPalette } from '@nclslbrn/artistry-swatch'
import { consume, repeatedly2d } from '@thi.ng/transducers'
import { $compile } from '@thi.ng/rdom'

const { floor, ceil } = Math

let state = {
        types: [],
        t: 0,
        alter: null
    },
    cnvs = null

const windowFrame = document.getElementById('windowFrame'),
    set1 = [...'▖▗▘▝▙▚▛▜▟■'],
    set2 = [...'/\\|_-'],
    cell = [24, 24],
    margin = 80

const init = () => {
    cnvs = document.getElementById('main')

    const ctx = cnvs.getContext('2d'),
        size = [window.innerWidth, window.innerHeight],
        dpr = adaptDPI(cnvs, ...size),
        inner = size.map((d) => d - margin * 2),
        gridDim = inner.map((d, i) => floor(d / cell[i]))

    console.log(
        `
      ${inner[0]} = ${cell[0]} * ${gridDim[0]}
      ${inner[1]} = ${cell[1]} * ${gridDim[1]}
      
      `
    )

    state.types = [
        ...repeatedly2d(
            (x, y) =>
                SYSTEM.float() > 0.5
                    ? set1[floor(SYSTEM.float() * set1.length)]
                    : set2[x % set2.length],
            ...gridDim
        )
    ]
    ctx.scale(dpr, dpr)
    draw(ctx, comp(cell, gridDim, size))
}

const comp = (cell, dim, size) =>
    group({}, [
        rect(size, { fill: '#121213' }),
        group(
            {
                // stroke: 'tomato'
                fill: '#fff',
                font: `${dim[1] - 16}px monospace`,
                align: 'center',
                baseline: 'middle'
            },
            state.types.reduce((g, n, i) => {
                const x = i % dim[0],
                    y = floor(i / dim[0])
                return [
                    ...g,
                    //rect([margin + x * cell[0], margin + y * cell[1]], dim)
                    text([margin + x * cell[0], margin + y * cell[1]], n)
                ]
            }, [])
        )
    ])

const update = () => {}

$compile(canvas('#main')).mount(windowFrame)
window.init = init
init()
