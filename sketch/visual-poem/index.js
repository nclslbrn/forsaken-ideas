// import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { rect, line, asSvg, group, polyline, svgDoc } from '@thi.ng/geom'
import { repeatedly } from '@thi.ng/transducers'
import { $compile, $list } from '@thi.ng/rdom'
import { div } from '@thi.ng/hiccup-html'
import { convertTree } from '@thi.ng/hiccup-svg'
import { alphabet } from './alphabet'

// import { svg } from '@thi.ng/hiccup-svg'
import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { subdiv } from './subdiv'
import { SYSTEM } from '@thi.ng/random'

const WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight,
    /*
    GRID = [
        [...'abcdef'],
        [...'ghijkl'],
        [...'mnopqr'],
        [...'stuvwx'],
        [...'yz']
    ],
    CELL = [WIDTH / 8, HEIGHT / 7],
  */
    ROOT = document.getElementById('windowFrame')
// start & collect subdivisions
/*
const glyphs = []
GRID.forEach((row, y) =>
    row.forEach((letter, x) =>
        alphabet[letter].map((path) => {
            glyphs.push(
                polyline(
                    path.map((p) => [
                        p[0] * CELL[0] + (x + 1) * CELL[0],
                        p[1] * CELL[1] + (y + 1) * CELL[1]
                    ])
                )
            )
        })
    )
)
*/
const grid = subdiv(rect([0.05, 0.05], [0.9, 0.9]), [], 0)
const comp = []
const text = [...'ingrid_is_in_the_grid_']

for (const cell of grid) {
    const cellPos = [cell.pos[0] * WIDTH, cell.pos[1] * HEIGHT]
    const cellSize = [cell.size[0] * WIDTH, cell.size[1] * HEIGHT]
    const inner = [SYSTEM.minmaxInt(2, 9), SYSTEM.minmaxInt(2, 9)]
    const charSize = [cellSize[0] / inner[0], cellSize[1] / inner[1]]
    let c = 0
    // comp.push(rect(cellPos, cellSize))

    for (let y = 0; y < inner[1]; y++) {
        for (let x = 0; x < inner[0]; x++) {
            const char = text[c % text.length]
            if (alphabet[char]) {
                alphabet[char].forEach((line) => {
                    comp.push(
                        polyline(
                            line.map((p) => [
                                p[0] * charSize[0] +
                                    cellPos[0] +
                                    x * charSize[0],
                                p[1] * charSize[1] +
                                    cellPos[1] +
                                    y * charSize[1]
                            ])
                        )
                    )
                })
            }
            c++
        }
    }
}

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
                        //glyphs
                        comp
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
