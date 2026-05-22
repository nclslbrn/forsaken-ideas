import { repeatedly } from '@thi.ng/transducers'
// import { textToStrokes } from './font'
import { polyline } from '@thi.ng/geom'
import { getGlyphVector } from '@nclslbrn/plot-writer'

export const charsGrid = (state, frame) => {
    const {
        fontSize,
        randText,
        randRule,
        wave,
        partition,
        palette,
        MARGIN,
        SIZE,
        MAX_COLS,
        MAX_ROWS
    } = state

    const chars = [
        ...repeatedly((y) => {
            const sample = `${randText}${wave}`
                .split('')
                .filter((_, x) => randRule(x, y))

            return Array.from(Array(MAX_COLS)).map(
                (_, i) => sample[i % sample.length]
            )
        }, MAX_ROWS)
    ]
    const letterColor = (x) =>
        partition.reduce(
            (colorRange, length, colIdx) => [
                x >= colorRange[1] && x <= length + colorRange[0]
                    ? colIdx
                    : colorRange[0],
                colorRange[1] + length
            ],
            [0, 0]
        )[0]

    let dx = MARGIN,
        dy = Array.from(Array(MAX_COLS)).map(() => MARGIN)

    const baseSizes = SIZE.map((d) => d - MARGIN * 2 - 24)
    // Glydph cell: char: String, size: Array[x, y]
    const glyphsGrid = chars.reduce((acc, lineChars, y) => {
        acc[y] = lineChars.map((char, x) => {
            const size = fontSize(x, y, frame, state)
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
        //if (dy >= SIZE[1] - MARGIN) return acc
        dx = MARGIN

        const polylineLines = lineChars.reduce((acc, letter, x) => {
            dx += letter.sizes[0]
            dy[x] += letter.sizes[1]

            // if (dx >= SIZE[0] - MARGIN - sizes[x]) return acc
            return [
                ...acc,
                ...getGlyphVector(
                    letter.char,
                    [letter.sizes[0] * 0.66, letter.sizes[1]],
                    [dx, dy[x]]
                ).map((line) =>
                    polyline(line, {
                        stroke: palette.colors[letterColor(x)]
                    })
                )
            ]
        }, [])

        return [...acc, ...polylineLines]
    }, [])
    return glyphsPath
}
