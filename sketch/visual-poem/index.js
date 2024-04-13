// import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { rect, line, asSvg, group, polyline, svgDoc } from '@thi.ng/geom'
// import { repeatedly } from '@thi.ng/transducers'
import { $compile } from '@thi.ng/rdom'
import { convertTree } from '@thi.ng/hiccup-svg'
import { alphabet, getGlyph } from './alphabet/main'
// import { glyphs } from './glyphs'
import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
// import { subdiv } from './subdiv'
// import { SYSTEM } from '@thi.ng/random'

const WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight,
    GRID = [],
    CELL = [WIDTH / 15, HEIGHT / 9],
    ROOT = document.getElementById('windowFrame')

Array.from(Object.keys(alphabet)).forEach((char, i) => {
    if (i % 13 === 0) {
        GRID.push([char])
    } else {
        GRID[Math.floor(i / 13)].push(char)
    }
})

const signs = []
GRID.forEach((row, y) =>
    row.forEach((glyph, x) => {
        const lines = getGlyph(glyph);
        return lines.map((path) => {
            signs.push(
                ...[
                    polyline(
                        path.map((p) => [
                            p[0] * CELL[0] + (x + 1) * CELL[0],
                            p[1] * CELL[1] + (y + 1) * CELL[1]
                        ])
                    ),
                    // |_
                    polyline([
                        [(x + 1) * CELL[0], (y + 1) * CELL[1]],
                        [(x + 1) * CELL[0], (y + 2) * CELL[1]],
                        [(x + 2) * CELL[0], (y + 2) * CELL[1]],
                    ], { stroke: '#333' })
                    
                ]
            )
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
