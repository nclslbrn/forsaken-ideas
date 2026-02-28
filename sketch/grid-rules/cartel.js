import { textToStrokes } from './font'
import { rect, transform, line, circle } from '@thi.ng/geom'
import * as mat from '@thi.ng/matrices'
/*
  Return an array of[x, y, width, heigth] cells

  @param {Array} - cell define the position of the cartel [x, y, width, height]
  @returns {array} - cells defines each cell in cartel
*/
const margin = 8

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
                [
                    dx + margin,
                    dy,
                    cellWidths[x] * width - margin,
                    cellHeights[y] * height - margin * 2
                ]
            ])
            dx += cellWidths[x] * width
        }
        dy += cellHeights[y] * height
    }
    return comp
}

/*
  Returns Hicup elem (rect, polyline) from stateParam and cartel cell

  @param {String|Array|Object|Number} trait - the parameter (value) to draw
  @param {Array} cell - cartel cell [x pos, y pos, width, height]
  @param {number} i - parameter and cell index

  @returns an array or a single Hicup element
*/
const cartelContent = (STATE, param, cell, i) => {
    const [cellX, cellY, cellW, cellH] = cell
    const trait = STATE[param]
    const textOption = { size: 18, tracking: 0, lineHeight: 1.4 }
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
            return textToStrokes(trait.toString(), {
                ...textOption,
                x: cellX + margin * 2,
                y: cellY + margin
            })

        // cols x rows
        case 2:
            const thumb = [
                (cellW - margin * trait[0]) / trait[0],
                (cellH - margin * trait[1]) / trait[1]
            ]
            const shapes = []
            for (let x = 0; x < trait[0]; x++) {
                for (let y = 0; y < trait[1]; y++) {
                    if (STATE.rule(x, y)) {
                        shapes.push(
                            rect(
                                [
                                    margin + cellX + margin * x + thumb[0] * x,
                                    margin + cellY + margin * y + thumb[1] * y
                                ],
                                thumb
                            )
                        )
                    } else {
                        shapes.push(
                            ...[
                                line(
                                    [
                                        margin +
                                            cellX +
                                            margin * x +
                                            thumb[0] * x,
                                        margin +
                                            cellY +
                                            margin * y +
                                            thumb[1] * y
                                    ],
                                    [
                                        margin +
                                            cellX +
                                            margin * x +
                                            thumb[0] * (x + 1),
                                        margin +
                                            cellY +
                                            margin * y +
                                            thumb[1] * (y + 1)
                                    ]
                                ),
                                line(
                                    [
                                        margin +
                                            cellX +
                                            margin * x +
                                            thumb[0] * (x + 1),
                                        margin +
                                            cellY +
                                            margin * y +
                                            thumb[1] * y
                                    ],
                                    [
                                        margin +
                                            cellX +
                                            margin * x +
                                            thumb[0] * x,
                                        margin +
                                            cellY +
                                            margin * y +
                                            thumb[1] * (y + 1)
                                    ]
                                )
                            ]
                        )
                    }
                }
            }
            return shapes

        // rotation
        case 3:
            return textToStrokes(trait.toFixed(3).toString(), {
                ...textOption,
                x: cellX + margin * 2,
                y: cellY + margin
            })

        // skew
        case 4:
            return [
                transform(
                    rect([0, 0], [textOption.size, textOption.size], {
                        fill: 'tomato'
                    }),
                    mat.concat(
                        [],
                        mat.translation23(null, [
                            STATE.width / 2 + textOption.size / 2,
                            STATE.height / 2 + textOption.size / 2
                        ]),
                        // mat.scale23(null, [0.5, 0.5]),
                        mat[trait.type](null, trait.angle[0]),
                        mat.translation23(null, [
                            -STATE.width / 2 +
                                cellX +
                                margin * 2 -
                                textOption.size / 2,
                            -STATE.height / 2 +
                                cellY +
                                margin -
                                textOption.size / 2
                        ])
                    )
                ),
                ...textToStrokes(
                    `${trait.type} [${trait.angle.map((x) => x.toFixed(2))}]`,
                    {
                        ...textOption,
                        x: cellX + margin * 2,
                        y: cellY + margin
                    }
                )
            ]

        // cell dupplicated
        case 5:
            return [
                ...(trait
                    ? [
                          circle(
                              [
                                  cellX + margin * 2,
                                  cellY + margin + textOption.size / 2
                              ],
                              textOption.size / 2
                          ),
                          circle(
                              [
                                  cellX + margin * 2 + textOption.size / 1.5,
                                  cellY + margin + textOption.size / 2
                              ],
                              textOption.size / 2
                          )
                      ]
                    : [
                          circle(
                              [
                                  cellX + margin * 2,
                                  cellY + margin + textOption.size / 2
                              ],
                              textOption.size / 2
                          )
                      ]),
                ...textToStrokes(trait ? 'Dupplicated' : 'Separated', {
                    ...textOption,
                    x: cellX + margin * 2 + textOption.size * (trait ? 1.5 : 1),
                    y: cellY + margin
                })
            ]
    }
}

export { cartelCells, cartelContent }
