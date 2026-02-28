// render.mjs
import { meta, glyphs } from './EMSReadability'
import { polyline } from '@thi.ng/geom'

export function textToStrokes(
    text,
    { size = 72, x = 0, y = 0, tracking = 0, lineHeight = 1.4 } = {}
) {
    const scale = size / meta.ascent
    const lineStep = size * lineHeight

    return text.split(/\r?\n/).flatMap((line, lineIndex) => {
        const baseline = y + meta.ascent * scale + lineIndex * lineStep
        let cursor = x

        return [...line].flatMap((char) => {
            const g = glyphs[char]
            const advance = (g?.W ?? meta.defaultAdvance) * scale + tracking
            const strokes = g
                ? g.s.map((stroke) =>
                      polyline(
                          stroke.map(([gx, gy]) => [
                              cursor + gx * scale,
                              baseline - gy * scale
                          ])
                      )
                  )
                : []
            cursor += advance
            return strokes
        })
    })
}
