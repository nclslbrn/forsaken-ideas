import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { SYSTEM, pickRandom } from '@thi.ng/random'
import { downloadCanvas, canvasRecorder } from '@thi.ng/dl-asset'
import { group, text, rect } from '@thi.ng/geom'
import { draw } from '@thi.ng/hiccup-canvas'

let state = {}

const { floor } = Math,
    sentence = [...'I like grid and grid likes me. '],
    symbols = [...'=±≡⊥—⊫ǁ⊠⊡⊢⊣⊤⊥⊦⊧⊨⊩⊪⊫'],
    palette = [
        'tomato',
        'white',
        'yellow',
        'orange',
        'LightCoral',
        'DarkSalmon'
    ],
    windowFrame = document.getElementById('windowFrame'),
    loader = document.getElementById('loading'),
    canvas = document.createElement('canvas'),
    fps = 24,
    recorder = canvasRecorder(canvas, 'undetermined-type-grid', { fps: 24 }),
    ctx = canvas.getContext('2d'),
    doUpdate = true

let timer = 0,
    frame = 0,
    chars = [],
    colors = [],
    inject = '|',
    alterDir = { sel: 'x', way: true },
    currColor = 'white',
    loop = 0,
    altering = false

canvas.width = window.innerWidth
canvas.height = window.innerHeight
canvas.captureStream()
windowFrame.appendChild(canvas)

const alter = (dir, x, y, l, c) => {
    if (altering) return
    const { cols, rows } = state
    altering = true
    if (x >= 0) {
        if (dir) {
            // push top
            chars.splice(x * rows, 0, l)
            chars.splice(x * rows + rows, 1)
            colors.splice(x * rows, 0, c)
            colors.splice(x * rows + rows, 1)
        } else {
            // push bottom
            chars.splice(x * rows + rows, 0, l)
            chars.splice(x * rows, 1)
            colors.splice(x * rows + rows, 0, c)
            colors.splice(x * rows, 1)
        }
    } else if (y >= 0) {
        if (dir) {
            // push left
            for (let x = cols; x >= 0; x--) {
                chars[x * rows + y] = chars[(x - 1) * rows + y]
                colors[x * rows + y] = colors[(x - 1) * rows + y]
            }
            chars[y] = l
            colors[y] = c
        } else {
            // push right
            for (let x = 0; x < cols; x++) {
                chars[x * rows + y] = chars[(x + 1) * rows + y]
                colors[x * rows + y] = colors[(x + 1) * rows + y]
            }
            chars[rows * (cols - 1) + y] = l
            colors[rows * (cols - 1) + y] = c
        }
    }
    // remove elements if array is larger than needed
    chars.splice(cols * rows, chars.length - cols * rows)
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
            chars.push(sentence[(x * rows * y) % sentence.length])
            colors.push('white')
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
    if (loop === fps * 120) recorder.stop()
    if (loop % 600 === 0) {
        inject = sentence
        currColor = 'white'
    }
    if (loop % 150 === 0) {
        alterDir.sel = alterDir.sel === 'x' ? 'y' : 'x'
        currColor = pickRandom(palette)
    }

    if (loop % 250 === 0) {
        if (SYSTEM.float() > 0.5) {
            inject = pickRandom(symbols)
            currColor = pickRandom(palette)
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
        currColor = pickRandom(palette)
    }
    loop++

    alter(
        alterDir.way,
        alterDir.sel === 'x' ? SYSTEM.minmaxInt(0, cols) : -1,
        alterDir.sel === 'y' ? SYSTEM.minmaxInt(0, rows) : -1,
        inject.length > 1 ? inject[frame % inject.length] : inject,
        currColor
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
                    chars[x * rows + y],
                    { fill: colors[x * rows + y] }
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

init()
windowFrame.removeChild(loader)
window.onresize = init()

//recorder.start()
document.addEventListener('keydown', () => {
    frame = 0
})
window.init = init
window.export_JPG = () => downloadCanvas(canvas, `text`)
window.infobox = infobox
handleAction()
