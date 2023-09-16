import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { Smush32 } from '@thi.ng/random'
// import { repeatedly } from '@thi.ng/transducers'
import { downloadCanvas } from '@thi.ng/dl-asset'
import { group, text, rect } from '@thi.ng/geom'
import { draw } from '@thi.ng/hiccup-canvas'

let state = {}

const rnd = new Smush32(0xdecafbad),
    windowFrame = document.getElementById('windowFrame'),
    loader = document.getElementById('loading'),
    canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d'),
    { ceil, floor } = Math

canvas.width = window.innerWidth
canvas.height = window.innerHeight
windowFrame.appendChild(canvas)

let timer = 0,
    doUpdate = false,
    chars = [...'=±≡⊥—⊫[]ǁ|-⊠⊡⊢⊣⊤⊥⊦⊧⊨⊩⊪⊫']

// kind of p5 setup
const init = () => {
    const margin = rnd.minmaxInt(20, 120),
        cellSize = rnd.minmaxInt(24, 68),
        bounds = [canvas.width - margin * 2, canvas.height - margin * 2],
        cols = floor(bounds[0] / cellSize),
        rows = floor(bounds[1] / cellSize),
        remains = [bounds[0] - cols * cellSize, bounds[1] - rows * cellSize]
    state = {
        cellSize,
        cols,
        rows,
        margin: remains.map((v) => v / 2 + margin)
    }
    cancelAnimationFrame(timer)
    update()
}

// draw loop
const update = () => {
    const { cellSize, cols, rows, margin } = state
    const textTable = []
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            textTable.push(
                text(
                    [
                        margin[0] + cellSize * x + cellSize * 0.5,
                        margin[1] + cellSize * y + cellSize * 0.5
                    ],
                    chars[floor(rnd.float() * chars.length)]
                )
            )
        }
    }
    draw(
        ctx,
        group({}, [
            rect([canvas.width, canvas.height], { fill: '#111' }),
            group(
                {
                    fill: '#fff',
                    //fill: '#00000000',
                    font: `${cellSize}px monospace`,
                    align: 'center',
                    baseline: 'middle'
                },
                textTable
            )
        ])
    )
    doUpdate && (timer = requestAnimationFrame(update))
    console.log(state)
}

// kick off
init()
windowFrame.removeChild(loader)
window.init = init
window.export_JPG = () => downloadCanvas(canvas, `text`)
window.infobox = infobox
handleAction()
