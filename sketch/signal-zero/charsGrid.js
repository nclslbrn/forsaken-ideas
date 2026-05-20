import { repeatedly } from '@thi.ng/transducers'
import { textToStrokes } from './font'
import { polyline } from '@thi.ng/geom'

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
        ...repeatedly(
            (y) =>
                `${randText}${wave}`
                    .split('')
                    .filter((_, x) => randRule(x, y) && x < MAX_COLS),
            MAX_ROWS
        )
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
        dy = MARGIN

    const glyphsPath = chars.reduce((acc, lineChars, y) => {
        if (dy >= SIZE[1] - MARGIN) return acc
        dx = MARGIN

        const normSizes = lineChars.map((_, x) => fontSize(x, y, frame, state))
        const baseSize = (SIZE[0] - MARGIN * 2) * 0.66
        const sumSizes = normSizes.reduce((acc, sum) => acc + sum, 0)
        const sizes = normSizes.map((x) => baseSize * (x / sumSizes))
        const polylineLines = lineChars.reduce((acc, letter, x) => {
            dx += sizes[x] * 1.33
            if (dx >= SIZE[0] - MARGIN - sizes[x]) return acc
            return [
                ...acc,
                ...textToStrokes(letter, { x: dx, y: dy, size: sizes[x] }).map(
                    (line) =>
                        polyline(line, {
                            stroke: palette.colors[letterColor(x)]
                        })
                )
            ]
        }, [])
        dy += (SIZE[1] - MARGIN * 2) / MAX_ROWS
        return [...acc, ...polylineLines]
    }, [])
    return glyphsPath
}
