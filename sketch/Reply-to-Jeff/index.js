import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import getPalette from './palette'
import { SYSTEM, coin, pickRandom } from '@thi.ng/random'
//import { downloadCanvas, canvasRecorder } from '@thi.ng/dl-asset'
import { downloadCanvas } from '@thi.ng/dl-asset'
import { group, rect, line } from '@thi.ng/geom'
import { draw } from '@thi.ng/hiccup-canvas'

const dpr = window.devicePixelRatio || 1,
    windowFrame = document.getElementById('windowFrame'),
    loader = document.getElementById('loading'),
    canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d'),
    margin = 50

canvas.width = window.innerWidth * dpr
canvas.height = window.innerHeight * dpr
windowFrame.appendChild(canvas)

const roundToSpacing = (v, spacing) => Math.round(v / spacing) * spacing

const splitRect = (orig, spacing) => {
    const splitVert = coin()
    // split vertically
    if (splitVert && orig.size[0] > spacing * 8) {
        const splitX =
            orig.pos[0] +
            roundToSpacing(
                SYSTEM.minmaxInt(spacing * 2, orig.size[0] - spacing * 2),
                spacing
            )
        return [
            rect(orig.pos, [splitX - orig.pos[0] - spacing, orig.size[1]]),
            rect(
                [splitX + spacing, orig.pos[1]],
                [orig.pos[0] + orig.size[0] - splitX - spacing, orig.size[1]]
            )
        ]
    }
    // split horizontally
    else if (orig.size[1] > spacing * 8) {
        const splitY =
            orig.pos[1] +
            roundToSpacing(
                SYSTEM.minmaxInt(spacing * 2, orig.size[1] - spacing * 2),
                spacing
            )
        return [
            rect(orig.pos, [orig.size[0], splitY - orig.pos[1] - spacing]),
            rect(
                [orig.pos[0], splitY + spacing],
                [orig.size[0], orig.pos[1] + orig.size[1] - splitY - spacing]
            )
        ]
    } else {
        return [orig]
    }
}

const init = () => {
    const bounds = [canvas.width - margin * 2, canvas.height - margin * 2],
        palette = getPalette(),
        spacing = 2 * SYSTEM.minmaxInt(4, 8),
        randomSplit = coin()

    let rects = [rect([margin, margin], bounds)]

    for (let i = 0; i < 100; i++) {
        let rectToSplit

        if (randomSplit) {
            rectToSplit = SYSTEM.minmaxInt(0, rects.length)
        } else {
            const sortedBySize = rects.sort(
                (a, b) =>
                    Math.hypot(b.size[0], b.size[1]) -
                    Math.hypot(a.size[0], a.size[1])
            )
            rectToSplit = rects.indexOf(sortedBySize[0])
        }
        const newRects = splitRect(rects[rectToSplit], spacing)
        rects.splice(rectToSplit, 1, ...newRects)
    }

    const lines = []
    const coloredRect = []

    for (let i = 0; i < rects.length; i++) {
        if (Math.max(...rects[i].size) < spacing * 2) continue

        const attribs = { fill: `rgb(${pickRandom(palette)})` }
        const side = SYSTEM.minmaxInt(0, 3)
        const size = spacing

        switch (side) {
            case 0:
                coloredRect.push(
                    rect(rects[i].pos, [rects[i].size[0], size], attribs)
                )
                rects[i].pos[1] += size
                rects[i].size[1] -= size
                break
            case 1:
                coloredRect.push(
                    rect(
                        [
                            rects[i].pos[0] + rects[i].size[0] - size,
                            rects[i].pos[1]
                        ],
                        [size, rects[i].size[1]],
                        attribs
                    )
                )
                rects[i].size[0] -= size
                break
            case 2:
                coloredRect.push(
                    rect(
                        [
                            rects[i].pos[0],
                            rects[i].pos[1] + rects[i].size[1] - size
                        ],
                        [rects[i].size[0], size],
                        attribs
                    )
                )
                rects[i].size[1] -= size
                break
            case 3:
                coloredRect.push(
                    rect(rects[i].pos, [size, rects[i].size[1]], attribs)
                )
                rects[i].pos[0] += size
                rects[i].size[0] -= size
                break
        }
    }

    rects.forEach((r) => {
        if (r.size[0] < r.size[1]) {
            for (let y = spacing; y < r.size[1]; y += spacing) {
                lines.push(
                    line([
                        [r.pos[0], r.pos[1] + y],
                        [r.pos[0] + r.size[0], r.pos[1] + y]
                    ])
                )
            }
        } else {
            for (let x = spacing; x < r.size[0]; x += spacing) {
                lines.push(
                    line([
                        [r.pos[0] + x, r.pos[1]],
                        [r.pos[0] + x, r.pos[1] + r.size[1]]
                    ])
                )
            }
        }
    })

    draw(
        ctx,
        group({}, [
            rect([canvas.width, canvas.height], { fill: '#f0f3f2' }),
            group({ stroke: '#333' }, rects),
            group({ stroke: '#333' }, lines),
            group({ stroke: '#333' }, coloredRect)
        ])
    )

    const logColor = {
        sign: palette.map((_) => '%c  '),
        style: palette.map((col) => `background: rgb(${col});`)
    }
    console.log(logColor.sign.join(' '), ...logColor.style)
    console.log('Division: ', randomSplit ? 'random' : 'by size')
    console.log('Spacing: ', spacing)
}

windowFrame.removeChild(loader)
init()

window.onresize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    init()
}
window.init = init
window.download = () => downloadCanvas(canvas, `Reply-to-Jeff`)
window.infobox = infobox
handleAction()
