import { dist2, mixN2 } from '@thi.ng/vectors'
import { SYSTEM } from '@thi.ng/random'

/**
 * Create dash along a line
 * @param {Array} line [[x1, y1], [x2, y2]]
 * @param {Number} step maximum dash length
 * @param {Number} mode 0: straight 1: random
 * @param {Object} rnd a @thi.ng/random generator (SYSTEM by default)
 *
 * @returns {Array} of [[x1, y1], [x2, y2]] dashes
 */
export default function ([a, b], step, mode, rnd = SYSTEM) {
    const size = dist2(a, b)
    const dashes = []
    let r = 0

    while (r < size) {
        // random line length, clamped to the end of the line
        const lineLength = Math.min(
            step * (mode === 0 ? 0.15 : 0.3 * rnd.float()),
            size - r
        )
        dashes.push([
            mixN2([], a, b, r / size),
            mixN2([], a, b, (r + lineLength) / size)
        ])
        // little jump between lines
        r += lineLength + step * (mode === 0 ? 0.15 : 0.15 * rnd.float())
    }
    return dashes
}
