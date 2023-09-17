import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { SYSTEM, pickRandom } from '@thi.ng/random'
import { downloadCanvas } from '@thi.ng/dl-asset'
import { group, text, rect } from '@thi.ng/geom'
import { draw } from '@thi.ng/hiccup-canvas'

let state = {}

const { floor } = Math,
    sentence = [...'gggrrriiiddd '],
    symbols = [...'=±≡⊥—⊫ǁ⊠⊡⊢⊣⊤⊥⊦⊧⊨⊩⊪⊫'],
    windowFrame = document.getElementById('windowFrame'),
    loader = document.getElementById('loading'),
    canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d'),
    doUpdate = true,
    fps = 35,
    timestep = 1000 / fps

let timer = 0,
    frame = 0,
    lastTimestamp = 0,
    chars = [],
    inject = '|',
    alterDir = { sel: 'x', way: true },
    loop = 0,
    altering = false

canvas.width = window.innerWidth
canvas.height = window.innerHeight
windowFrame.appendChild(canvas)

const alter = (dir, x, y, l) => {
    if (altering) return
    const { cols, rows } = state
    altering = true
    if (x >= 0) {
        if (dir) {
            // push top
            chars.splice(x * rows, 0, l)
            chars.splice(x * rows + rows, 1)
        } else {
            // push bottom
            chars.splice(x * rows + rows, 0, l)
            chars.splice(x * rows, 1)
        }
    } else if (y >= 0) {
        if (dir) {
            // push left
            for (let x = cols; x >= 0; x--) {
                chars[x * rows + y] = chars[(x - 1) * rows + y]
            }
            chars[y] = l
        } else {
            // push right
            for (let x = 0; x < cols; x++) {
                chars[x * rows + y] = chars[(x + 1) * rows + y]
            }
            chars[rows * (cols - 1) + y] = l
        }
    }
    // remove elements if array is larger than needed
    chars.splice(cols * rows, chars.length - cols * rows)
    console.log(cols * rows, chars.length)
    altering = false
}

// kind of p5 setup
const init = () => {
    cancelAnimationFrame(timer)
    const margin = SYSTEM.minmaxInt(20, 100),
        cellSize = SYSTEM.minmaxInt(24, 72),
        bounds = [canvas.width - margin * 2, canvas.height - margin * 2],
        cols = floor(bounds[0] / cellSize),
        rows = floor(bounds[1] / cellSize),
        remains = [bounds[0] - cols * cellSize, bounds[1] - rows * cellSize]

    frame = 0
    chars = []

    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            //chars.push(pickRandom(alphabet))
            chars.push(sentence[(x * rows * y) % sentence.length])
            //chars.push(sentence[x % sentence.length])
            // debug chars.push(x * rows + y)
        }
    }
    state = {
        cellSize,
        cols,
        rows,
        margin: remains.map((v) => v / 2 + margin)
    }
    update()
}

// draw loop
const update = () => {
    const { cellSize, cols, rows, margin } = state
    // Change if we reach the end of the loop
    if (frame - lastTimestamp < timestep) {
        lastTimestamp = frame
        if (loop % 600 === 0) inject = sentence
        if (loop % 150 === 0) alterDir.sel = alterDir.sel === 'x' ? 'y' : 'x'

        if (loop % 250 === 0) {
            if (SYSTEM.float() > 0.5) {
                inject = pickRandom(symbols)
            } else {
                if (symbols.includes(inject) || sentence === inject) {
                    inject = SYSTEM.float() > 0.5 ? '_' : '|'
                } else {
                    inject = inject === '_' ? '|' : '_'
                }
            }
        }
        if (loop % 200 === 0 && SYSTEM.float() > 0.5) {
            alterDir.way = !alterDir.way
        }
        loop++
    }

    alter(
        alterDir.way,
        alterDir.sel === 'x' ? SYSTEM.minmaxInt(0, cols) : -1,
        alterDir.sel === 'y' ? SYSTEM.minmaxInt(0, rows) : -1,
        inject.length > 1 ? inject[frame % inject.length] : inject
    )

    // Draw the array of chars
    const textTable = []
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            textTable.push(
                text(
                    [
                        margin[0] + cellSize * x + cellSize * 0.5,
                        margin[1] + cellSize * y + cellSize * 0.5
                    ],
                    chars[x * rows + y]
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
                    font: `${cellSize}px monospace`,
                    align: 'center',
                    baseline: 'middle'
                },
                textTable
            )
        ])
    )
    frame++
    doUpdate && (timer = requestAnimationFrame(update))
}

// kick off
init()
windowFrame.removeChild(loader)
window.onresize = init()
document.addEventListener('keydown', () => update())
window.init = init
window.export_JPG = () => downloadCanvas(canvas, `text`)
window.infobox = infobox
handleAction()
