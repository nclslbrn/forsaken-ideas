// import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { rect, line, asSvg, group, polyline, svgDoc } from '@thi.ng/geom'
import { repeatedly } from '@thi.ng/transducers'
import { $compile, $list } from '@thi.ng/rdom'
import { convertTree } from '@thi.ng/hiccup-svg'
import { alphabet } from './alphabet'
import { glyphs } from './glyphs'
import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { subdiv } from './subdiv'
//import { SYSTEM } from '@thi.ng/random'

const WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight,
    SHAPES = Object.keys(glyphs),
    GRID = [
        /*
        [...'abcdef'],
        [...'ghijkl'],
        [...'mnopqr'],
        [...'stuvwx'],
        [...'yz']
        */

        ...repeatedly(
            () => [
                ...repeatedly(
                    () => SHAPES[Math.floor(Math.random() * SHAPES.length)],
                    8
                )
            ],
            7
        )
    ],
    CELL = [WIDTH / 10, HEIGHT / 9],
    ROOT = document.getElementById('windowFrame')
// start & collect subdivisions
console.log(JSON.stringify(GRID))
const signs = []
GRID.forEach((row, y) =>
    row.forEach((glyph, x) =>
        glyphs[glyph].map((path) => {
            signs.push(
                ...[
                    polyline(
                        path.map((p) => [
                            p[0] * CELL[0] + (x + 1) * CELL[0],
                            p[1] * CELL[1] + (y + 1) * CELL[1]
                        ])
                    ),
                    // |
                    polyline([
                        [(x + 2) * CELL[0], (y + 1) * CELL[1]],
                        [(x + 2) * CELL[0], (y + 2) * CELL[1]]
                    ])
                ]
            )
        })
    )
)

/*
const grid = subdiv(rect([0.05, 0.05], [0.9, 0.9]), [], 0)
const comp = []
const text = [
  ...(Math.random() > 0.5 
  ? 'Letters written in white on a black background placed within each square of a modular grid in the order of this sentence'
  : 'Lettres écrites en blanc sur fond noir placées au sein de chaque case d\'une grille modulaire dans l\'ordre de cette énoncé')
]

grid.forEach((cell, i) => {
    const cellPos = [cell.pos[0] * WIDTH, cell.pos[1] * HEIGHT]
    const cellSize = [cell.size[0] * WIDTH, cell.size[1] * HEIGHT]
    comp.push(rect(cellPos, cellSize, { fill: "#111" }))
    const char = text[i % text.length]
    if (alphabet[char]) {
        alphabet[char].forEach((line) => {
            comp.push(
                polyline(
                    line.map((p) => [
                        p[0] * cellSize[0] + cellPos[0],
                        p[1] * cellSize[1] + cellPos[1]
                    ]),
                    { stroke: "#fefefe" }
                )
            )
        })
    }
})
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
                    rect([WIDTH, HEIGHT], { fill: 'white' }),
                    group(
                        {
                            lineJoin: 'round',
                            lineCap: 'round',
                            stroke: '#333',
                            fill: 'rgba(0,0,0,0)',
                            weight: 2
                        },
                        signs
                        // comp
                    )
                ])
            )
        )
    ).mount(ROOT)
}
init()
window.init = init
// window.capture = sketch.exportJPG
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
