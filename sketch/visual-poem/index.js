import { rect, group, polyline, svgDoc, asSvg } from '@thi.ng/geom'
import { $compile } from '@thi.ng/rdom'
import { convertTree } from '@thi.ng/hiccup-svg'
import { alphabet, getGlyph } from './alphabet/main'
import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { QUOTE } from './star-wars-quote';

const WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight,
    GRID = [],
    CELL = [
      10 * Math.ceil(Math.random() * 10), 
      10 * Math.ceil(Math.random() * 10)
    ],
    ROOT = document.getElementById('windowFrame'),
    RAND_GRID = Math.random() > 0.15,
    TABLE_SIZE = [
      Math.floor(WIDTH / CELL[0]) - 2,  
      Math.floor(HEIGHT / CELL[1]) - 2
    ]
/**
 * Build a 2D array of chars (from alphabet key)
 */
const glyphList = Array.from(Object.keys(alphabet))
if (!RAND_GRID) {
  glyphList.forEach((char, i) => {
      if (i % TABLE_SIZE[0] === 0) {
          GRID.push([char])
      } else {
          GRID[Math.floor(i / TABLE_SIZE[0])].push(char)
      }
  })
} else {
  const randChars = QUOTE[Math.floor(Math.random() * QUOTE.length)]
  for (let i = 0; i < TABLE_SIZE[1]; i++) {
    const row = []
    for (let j = 0; j < TABLE_SIZE[0]; j++) {
      row.push(randChars[(i * (TABLE_SIZE[0]) + j) % randChars.length])
    }
    GRID.push(row)
  }
}

const signs = []
GRID.forEach((row, y) =>
    row.forEach((glyph, x) => {
        const lines = getGlyph(glyph)
        lines.map((segment) => {
            signs.push(
                ...[
                    polyline(
                        segment.map((p) => [
                            p[0] * CELL[0] + (x + 1) * CELL[0],
                            p[1] * CELL[1] + (y + 1) * CELL[1]
                        ])
                    ),
                    // |_
                    polyline(
                        (x > 0 
                        ? [
                            [(x + 1) * CELL[0], (y + 1) * CELL[1]],
                            [(x + 1) * CELL[0], (y + 2) * CELL[1]],
                            [(x + 2) * CELL[0], (y + 2) * CELL[1]]
                          ]
                        : [
                            [(x + 1) * CELL[0], (y + 2) * CELL[1]],
                            [(x + 2) * CELL[0], (y + 2) * CELL[1]]
                        ]),
                        { stroke: '#333' }
                    )
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
