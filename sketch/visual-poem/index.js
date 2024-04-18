import { rect, group, pathFromSvg, svgDoc, asSvg } from '@thi.ng/geom'
import { $compile } from '@thi.ng/rdom'
import { convertTree } from '@thi.ng/hiccup-svg'
import { alphabet, getGlyph } from './alphabet/main'
import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { QUOTE } from './star-wars-quote'
import path from 'path'

const WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight,
    GRID = [],
    CELL = [WIDTH / 15, HEIGHT / 9],
    ROOT = document.getElementById('windowFrame')
/**
 * Build a 2D array of chars (from alphabet key)
 */
const glyphList = Array.from(Object.keys(alphabet))

glyphList.forEach((char, i) => {
    if (i % 13 === 0) {
        GRID.push([char])
    } else {
        GRID[Math.floor(i / 13)].push(char)
    }
})

const signs = []
GRID.forEach((row, y) =>
    row.forEach((glyph, x) => {
        const paths = getGlyph(
            glyph,
            [CELL[0], CELL[1]],
            [(x + 1) * CELL[0], (y + 1) * CELL[1]]
        )
        // prevent drawing empty path <space>
        // if (paths.length) {
        //     paths.forEach((com) => signs.push(...pathFromSvg(com)))
        /// }
        paths.forEach((p) => {
                console.log(p)
            if (p.segments) {
                signs.push(p)
            }
        })
    })
)

/*
const text = [
  ...(Math.random() > 0.5 
  ? 'Letters written in white on a black background placed within each square of a modular grid in the order of this sentence'
  : 'Lettres écrites en blanc sur fond noir placées au sein de chaque case d\'une grille modulaire dans l\'ordre de cette énoncé')
]
*/

const init = () => {
    $compile(
        convertTree(
            svgDoc(
                {
                    width: WIDTH,
                    height: HEIGHT,
                    viewBox: `0 0 ${WIDTH} ${HEIGHT}`
                },
                group({}, [
                    rect([WIDTH, HEIGHT], { fill: '#111' }),
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
    ).mount(ROOT)
}
init()
window.init = init

window.capture = () => {
    const cnvs = document.createElement('canvas')
    cnvs.width = WIDTH
    cnvs.height = HEIGHT
    const ctx = cnvs.getContext('2d')
    draw(
        ctx,
        group({}, [
            rect([WIDTH, HEIGHT], { fill: '#111111' }),
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
                    width: WIDTH,
                    height: HEIGHT,
                    viewBox: `0 0 ${WIDTH} ${HEIGHT}`
                },
                group({}, [
                    rect([WIDTH, HEIGHT], { fill: '#111' }),
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
                [(x * CELL[0]) / 2, 0],
                [(x * CELL[0]) / 2, HEIGHT]
            ),
        16
    ),
    ...repeatedly(
        (y) =>
            line(
                [0, (y * CELL[1]) / 2],
                [WIDTH, (y * CELL[1]) / 2]
            ),
        14
    )
])
*/
