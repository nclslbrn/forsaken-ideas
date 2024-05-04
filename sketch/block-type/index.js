import { rect, group, svgDoc, asSvg, pathFromSvg } from '@thi.ng/geom'
import { SYSTEM } from '@thi.ng/random'
import { $compile } from '@thi.ng/rdom'
import { convertTree } from '@thi.ng/hiccup-svg'
import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { getGlyphPath } from './plotWriter'

const ROOT = document.getElementById('windowFrame'),
    RND = SYSTEM,
    CHARS = [...'No it\'s fine ']

let signs, width, height, margin

const stack = (num) => {
    let o = []
    for (let i = 0; i < num; i++) {
        o.push(RND.float())
    }
    const sum = o.reduce((a, v) => a + v) 
    return o.map((v) => v / sum)
}

const fillPart = (x, y, w, h, b) => {
    const cols = Math.ceil(w / b),
        rows = Math.ceil(h / b)
    const out = []
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const idx = i + cols * j,
                pos = [x + i * b, y + j * b],
                siz = [
                    i === cols - 1 ? w - 2 - i * b : b - 2,
                    j === rows - 1 ? h - 2 - j * b : b - 2
                ]
                

            const paths = getGlyphPath(CHARS[idx % CHARS.length], siz, pos)
            paths.forEach((d) => {
                out.push(...pathFromSvg(d))
            })
        }
    }
    return out
}

const init = () => {
    ROOT.innerHTML = ''
    margin = Math.hypot(window.innerWidth, window.innerHeight) * 0.02
    width = window.innerWidth - (margin * 2)
    height = window.innerHeight - (margin * 2)
    signs = []

    const _e = {
        x: (v) => v * width,
        y: (v) => v * height
    }
    
    console.log(
      margin, _e.x(0),
      width, _e.x(1)
    )
    const yRange = stack(RND.minmaxInt(4, 8))
    let y = 0

    for (let i = 0; i < yRange.length; i++) {
        const dy = _e.y(yRange[i])
        const xRange = stack(RND.minmaxInt(4, 8))
        let x = 0

        for (let j = 0; j < xRange.length; j++) {
            const dx = _e.x(xRange[j])
            signs.push(...fillPart(margin + x, margin + y, dx, dy, margin * 0.6))
            x += dx
        }
        y += dy
    }

    $compile(
        convertTree(
            svgDoc(
                {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    viewBox: `0 0 ${window.innerWidth} ${window.innerHeight}`
                },
                group({}, [
                    rect([margin, margin], [width, height], { fill: '#ffeefe' }),
                    group(
                        {
                            lineJoin: 'round',
                            lineCap: 'round',
                            stroke: '#333',
                            fill: 'rgba(0,0,0,0)',
                            weight: 2
                        },
                        signs
                    )
                ])
            )
        )
    ).mount(ROOT)
}

init()
window.init = init
window.onresize = init

window.capture = () => {
    const cnvs = document.createElement('canvas')
    cnvs.width = width
    cnvs.height = height
    const ctx = cnvs.getContext('2d')
    draw(
        ctx,
        group({}, [
            rect([], { fill: '#111111' }),
            group(
                {
                    lineJoin: 'round',
                    lineCap: 'round',
                    stroke: '#fefefe',
                    fill: 'rgba(0,0,0,0)',
                    weight: 2
                },
                signs
            )
        ])
    )
    downloadCanvas(cnvs, 'visual-poem', 'jpeg')
}

window.downloadSVG = () => {
    downloadWithMime(
        'visual-poem.svg',
        asSvg(
            svgDoc(
                 {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    viewBox: `0 0 ${window.innerWidth} ${window.innerHeight}`
                },
                group({}, [
                    rect([margin, margin], [width, height], { fill: '#111' }),
                    group(
                        {
                            lineJoin: 'round',
                            lineCap: 'round',
                            stroke: '#fefefe',
                            fill: 'rgba(0,0,0,0)',
                            weight: 2
                        },
                        signs
                    )
                ])
            )
        )
    )
}
window.infobox = infobox
handleAction()

/*
 *
group({ stroke: 'lightgray', weight: 4 }, [
    ...repeatedly(
        (x) =>
            line(
                [(x * cell[0]) / 2, 0],
                [(x * cell[0]) / 2, HEIGHT]
            ),
        16
    ),
    ...repeatedly(
        (y) =>
            line(
                [0, (y * cell[1]) / 2],
                [WIDTH, (y * cell[1]) / 2]
            ),
        14
    )
])
*/
