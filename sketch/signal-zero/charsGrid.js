import { repeatedly } from '@thi.ng/transducers'
import { polyline } from '@thi.ng/geom'
import { getGlyphVector } from '@nclslbrn/plot-writer'
import { partitionColor } from './partition'
export const charsGrid = (state, frame) => {
    const { MARGIN, SIZE, MAX_COLS, MAX_ROWS, NUM_FRAME, WAVE } =
        state.constants

    const { fontSize, text, rule, partition, palette, colorAxis } =
        state.variations

    const chars = [
        ...repeatedly((y) => {
            const sample = `${text}${WAVE}`
                .split('')
                .filter((_, x) => rule(x, y))

            return Array.from(Array(MAX_COLS)).map(
                (_, i) => sample[i % sample.length]
            )
        }, MAX_ROWS)
    ]

    let dx = MARGIN,
        dy = Array.from(Array(MAX_COLS)).map(() => MARGIN)

    const baseSizes = SIZE.map((d) => d - MARGIN * 2 - 24)
    // Glydph cell: char: String, size: Array[x, y]
    const glyphsGrid = chars.reduce((acc, lineChars, y) => {
        acc[y] = lineChars.map((char, x) => {
            const size = fontSize(
                { x, y, frame },
                { MAX_COLS, MAX_ROWS, NUM_FRAME }
            )
            return { char, sizes: [size, size] }
        })
        return acc
    }, [])
    const colsRowsSum = [
        // Widths sums
        glyphsGrid.map((row) =>
            row.reduce((sum, cell) => (sum += cell.sizes[0]), 0)
        ),
        // Heights sums
        [
            ...repeatedly(
                (x) =>
                    glyphsGrid.reduce((sum, row) => sum + row[x].sizes[1], 0),
                MAX_COLS
            )
        ]
    ]
    const normGlyphsGrid = glyphsGrid.map((line, y) => {
        return line.map((cell, x) => {
            const normSizes = [
                (cell.sizes[0] / colsRowsSum[0][y]) * baseSizes[0],
                (cell.sizes[1] / colsRowsSum[1][x]) * baseSizes[1]
            ]
            return { char: cell.char, sizes: normSizes }
        })
    })
    const glyphsPath = normGlyphsGrid.reduce((acc, lineChars, y) => {
        dx = MARGIN
        const polylineLines = lineChars.reduce((acc, letter, x) => {
            dx += letter.sizes[0]
            dy[x] += letter.sizes[1]

            return letter.char !== ' '
                ? [
                      ...acc,
                      ...getGlyphVector(
                          letter.char,
                          [letter.sizes[0] * 0.66, letter.sizes[1]],
                          [dx, dy[x]]
                      ).map((line) =>
                          polyline(line, {
                              stroke: palette.colors[
                                  partitionColor(colorAxis ? x : y, partition)
                              ]
                          })
                      )
                  ]
                : acc
        }, [])

        return [...acc, ...polylineLines]
    }, [])
    return glyphsPath
}
