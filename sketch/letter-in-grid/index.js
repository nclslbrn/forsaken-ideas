import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import p5 from 'p5'
import { getGlyphVector } from '@nclslbrn/plot-writer'

const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

const sketch = (p5) => {
    const sentence = [
        ...'They devour that by which they themselves wish to be devoured.'.toUpperCase()
    ]
    const chars = [
        ':.:.:.:  .  ',
        '*  ^  *  ^  ',
        '__=-___==--_',
        '//  //  //  ',
        '° . ° . ° . ',
        '////__',
        '|------+-------',
        '#------',
        'word...:...',
        'devour;   '
    ]
    let cells = [[0, 0, 1, 1]],
        absrctTxt = [...p5.random(chars)],
        paths = [],
        readCursor = 0

    const baseSize = [12, 12]

    sketch.downloadSVG = () => {
        const data = new Blob(
            [
                `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\r\n` +
                    `<svg 
                      width="${window.innerWidth}"
                      height="${window.innerHeight}"
                      viewbox="0 0 ${window.innerWidth} ${window.innerHeight}"
                      >\r\n\t` +
                    `<style> path { fill: none; stroke: #333; }</style>\r\n\t\t` +
                    paths.reduce(
                        (lines, line) =>
                            `${lines}<path d="${line.reduce(
                                (d, v, i) =>
                                    `${d}${i === 0 ? 'M' : 'L'}${v[0]},${v[1]} `,
                                ''
                            )}"/>\r\n\t\t`,
                        ''
                    ) +
                    `\r\n\t</svg>`
            ],
            { type: 'image/svg+xml' }
        )
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(data)
        link.download = `letter-in-grid-${new Date().toISOString()}.svg`
        link.click()
    }
    sketch.downloadJPG = () =>
        p5.saveCanvas(`letter-in-grid-${new Date().toISOString()}`, 'jpg')

    const expand = (d, i) =>
        i % 2 === 0
            ? p5.map(d, 0, 1, 20, window.innerWidth - 40)
            : p5.map(d, 0, 1, 20, window.innerHeight - 40)

    const splitCell = () => {
        const toSplit = p5.floor(p5.random(cells.length))
        const [x, y, w, h] = cells[toSplit]
        const splitAt = p5.random([0.333, 0.5, 0.666])
        const splitOn = p5.random() > 0.5 ? 'x' : 'y'
        const splitted = []
        if (splitOn === 'x') {
            splitted.push(
                ...[
                    [x, y, w * splitAt, h],
                    [x + w * splitAt, y, w * (1 - splitAt), h]
                ]
            )
        } else {
            splitted.push(
                ...[
                    [x, y, w, h * splitAt],
                    [x, y + h * splitAt, w, h * (1 - splitAt)]
                ]
            )
        }
        cells.splice(toSplit, 1)
        cells.push(...splitted)
    }

    const fillCell = (cell) => {
        const scale = p5.random([0.5, 1, 2])
        const letterSize = baseSize.map((d) => d * scale)
        const [x, y, w, h] = cell.map((d, i) => expand(d, i))
        let sample = p5.random() > 0.75 ? absrctTxt : sentence
        for (
            let ly = baseSize[1] * 2;
            ly < h - baseSize[1] * 2;
            ly += letterSize[1]
        ) {
            for (
                let lx = baseSize[0] * 2;
                lx < w - baseSize[0] * 2;
                lx += letterSize[0]
            ) {
                const tIdx = readCursor % sample.length

                if (sample[tIdx] !== ' ') {
                    const glyph = getGlyphVector(
                        sample[tIdx],
                        [letterSize[0] * 0.8, letterSize[1]],
                        [x + lx - letterSize[0] / 2, y + ly - letterSize[1] / 2]
                    )
                    glyph.forEach((line) => paths.push(line))
                }
                if (sample !== sentence && p5.random() > 0.66) {
                    if (p5.random() > 0.5) {
                        readCursor--
                    }
                } else {
                    if (sample !== sentence) {
                        readCursor++
                    } else {
                        if (readCursor < sentence.length - 1) {
                            readCursor++
                        } else {
                            sample = [...p5.random(chars)]
                        }
                    }
                }
            }
        }
    }

    p5.setup = function () {
        p5.createCanvas(window.innerWidth, window.innerHeight)
        sketch.init()
    }

    sketch.init = () => {
        absrctTxt = [...p5.random(chars)]
        paths = []
        readCursor = 0
        cells = [[0, 0, 1, 1]]

        p5.background('#111')
        p5.noFill()
        p5.stroke('#fefefe')
        p5.strokeWeight(1.4)
        for (let i = 0; i < 36; i++) {
            splitCell()
        }

        cells.forEach((c) => fillCell(c))

        paths.forEach((l) => {
            p5.beginShape()
            l.forEach((pt) => p5.vertex(pt[0], pt[1]))
            p5.endShape()
        })
    }
}

new p5(sketch, containerElement)
containerElement.removeChild(loader)
window.init = sketch.init
window.downloadJPG = sketch.downloadJPG
window.downloadSVG = sketch.downloadSVG
window.infobox = infobox
handleAction()
