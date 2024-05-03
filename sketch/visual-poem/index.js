import {
  rect,
	group,
  svgDoc,
  asSvg,
  pathFromSvg
} from "@thi.ng/geom";
import { SYSTEM, pickRandom } from "@thi.ng/random";
import { $compile } from '@thi.ng/rdom'
import { convertTree } from '@thi.ng/hiccup-svg'
import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import { downloadCanvas, downloadWithMime } from '@thi.ng/dl-asset'
import { draw } from '@thi.ng/hiccup-canvas'
import { getGlyphPath } from './plotWriter'
const ROOT = document.getElementById('windowFrame'), RND = SYSTEM
let signs, width, height, str

const init = () => {
    console.log('*------ INIT ------*')
    const scale = 1 + RND.float() * 0.5,
    cell = [8, 12].map((i) => i * scale),
    chars = [...'l|1ijL!'],
    m = pickRandom([3, 5, 6, 7, 9]),
    string = [..."A picture is a picture of a picture of a picture of a picture of a picture"]
    
    width = window.innerWidth
    height = window.innerHeight
    const max_char = Math.ceil(((width / cell[0]) - 2) * ((height / cell[1]) - 2))
    str = Array.from(Array(max_char)).map(() => chars[Math.floor(RND.float() * chars.length)])
    // str = [...Array.from(Array()).reduce((acc) => (acc += [...chars.sort(() => RND.float() > 0.5)]), '')]
    ROOT.innerHTML = ''
    const lineLenght = Math.floor(width/cell[0]) - 2,
        grid = str.reduce((acc, char, i) => {
        const y = i % lineLenght, x = i - (y * lineLenght)
        const c = (x ^ y) % m ? char : pickRandom([...'_-=~^'])
          
        if (y === 0) {
            acc.push([c])
        } else {
            acc[Math.floor(i / lineLenght)].push(c)
        }
        return acc
    }, [])

    const signs = []
    grid.forEach((row, y) =>
        row.forEach((glyph, x) => {
            const paths = getGlyphPath(
                glyph,
                [cell[0], cell[1]],
                [(x+1) * cell[0], (y+1) * cell[1]]
            )
            paths.forEach((d) => {
                signs.push(...pathFromSvg(d))
            })
        })
    )

    $compile(
        convertTree(
            svgDoc(
                {
                    width,
                    height,
                    viewBox: `0 0 ${width} ${height}`
                },
                group({}, [
                    rect([width, height], { fill: '#ffeefe' }),
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
                    width,
                    height,
                    viewBox: `0 0 ${width} ${height}`
                },
                group({}, [
                    rect([width, height], { fill: '#111' }),
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
