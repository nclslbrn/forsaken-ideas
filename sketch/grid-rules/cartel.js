import { getParagraphVector } from '@nclslbrn/plot-writer'
import { rect, text, polyline } from '@thi.ng/geom'
/*
  Return an array of[x, y, width, heigth] cells

  @param {Array} - cell define the position of the cartel [x, y, width, height]
  @returns {array} - cells defines each cell in cartel
*/
const cartelCells = ([xPos, yPos, width, height]) => {
    const cellWidths = [0.2, 0.6, 0.2]
    const cellHeights = [0.8, 0.2]
    const traits = [
        ['pattern', 'rule', 'gridSize'],
        ['rotation', 'skew', 'areCellsDupplicated']
    ]
    let comp = []

    let dy = yPos
    for (let y = 0; y < 2; y++) {
        let dx = xPos
        for (let x = 0; x < 3; x++) {
            comp.push([
                traits[y][x],
                [dx, dy, cellWidths[x] * width, cellHeights[y] * height]
            ])
            dx += cellWidths[x] * width
        }
        dy += cellHeights[y] * height
    }
    return comp
}

// draw text with plotterWritter
const plotterWriterHelper = (text, [cellX, cellY, cellW, cellH]) => {
    const glyphs = getParagraphVector(text, 64, 0, 460, [1, 0.4])
    return glyphs.vectors.reduce(
        (acc, glyph, i) => [
            ...acc,
            ...glyph.map((line) =>
                polyline(line.map(([x, y]) => [cellX + x, cellY + y]))
            )
        ],
        []
    )
}
/*
  Returns Hicup elem (rect, polyline) from stateParam and cartel cell

  @param {String|Array|Object|Number} trait - the parameter (value) to draw
  @param {Array} cell - cartel cell [x pos, y pos, width, height]
  @param {number} i - parameter and cell index

  @returns an array or a single Hicup element
*/
const cartelContent = (trait, cell, i, color) => {
    const [cellX, cellY, cellW, cellH] = cell
    const margin = 8

    switch (i) {
        // pattern
        case 0:
            return trait.elem.map(([x, y, w, h]) =>
                rect(
                    [margin + cellX + x * cellW, margin + cellY + y * cellH],
                    [cellW * w - margin * 2, cellH * h - margin * 2]
                )
            )

        // rule
        case 1:
            return plotterWriterHelper(trait.toString(), [
                cellX,
                cellY,
                cellW,
                cellH
            ])

        // cols x rows
        case 2:
            const thumb = [
                (cellW - margin * trait[0]) / trait[0],
                (cellH - margin * trait[1]) / trait[1]
            ]
            const rects = []
            for (let x = 0; x < trait[0]; x++) {
                for (let y = 0; y < trait[1]; y++) {
                    rects.push(
                        rect(
                            [
                                cellX + margin * x + thumb[0] * x,
                                cellY + margin * y + thumb[1] * y
                            ],
                            thumb
                        )
                    )
                }
            }
            return rects

        // rotation
        case 3:
            return plotterWriterHelper(trait.toFixed(3).toString(), [
                cellX,
                cellY,
                cellW,
                cellH
            ])

        // skew
        case 4:
            return plotterWriterHelper(
                `${trait.type} [${trait.angle.map((x) => x.toFixed(2))}]`,
                [cellX, cellY, cellW, cellH]
            )

        // cell dupplicated
        case 5:
            return plotterWriterHelper(trait ? 'Dupplicated' : 'Separated', [
                cellX,
                cellY,
                cellW,
                cellH
            ])
    }
}

export { cartelCells, cartelContent }
