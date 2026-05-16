import { repeatedly } from '@thi.ng/transducers'
import { textToStrokes } from './font'
import { polyline } from '@thi.ng/geom'
const { round, max } = Math

export const charsGrid = (state, frame) => {
    const { fontSize, randText, randRule, wave, partition, palette } = state

    const chars = [
        ...repeatedly(
            (y) =>
                `${randText}${wave}`.split('').filter(
                    (_, i) =>
                        randRule(
                            // i + ((round(frame / 5) * 5) % state.MAX_COLS),
                            i + (frame % (state.MAX_COLS * state.MAX_ROWS)),
                            y
                        ) && i <= state.MAX_COLS
                ),
            state.MAX_ROWS
        )
    ]
    /*
    const grouped = partition.reduce((acc, length, gIdx, arr) => {
        const startIndex = arr.slice(0, gIdx).reduce((sum, len) => sum + len, 0)
        const textPart = chars.slice(startIndex, startIndex + length)
        textPart.length > 0 && acc.push(textPart)
        return acc
    }, [])
    */
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
    let dx = state.MARGIN,
        dy = state.MARGIN

    const glyphsPath = chars.reduce((acc, lineChars, y) => {
        if (dy >= state.SIZE[1] - state.MARGIN) return acc
        let maxFontSize = 0
        dx = state.MARGIN
        const polylineLines = lineChars.reduce((acc, letter, x) => {
            const size = fontSize(x, y, frame)
            dx += size * 0.66
            if (dx >= state.SIZE[0] - state.MARGIN - size) return acc
            maxFontSize = max(size, maxFontSize)
            return [
                ...acc,
                ...textToStrokes(letter, { x: dx, y: dy, size }).map((line) =>
                    polyline(line, { stroke: palette.colors[letterColor(x)] })
                )
            ]
        }, [])
        dy += maxFontSize
        return [...acc, ...polylineLines]
    }, [])
    return glyphsPath
}
