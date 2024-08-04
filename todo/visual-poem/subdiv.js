import { SYSTEM } from '@thi.ng/random'
import { rect } from '@thi.ng/geom'

const subdiv = (cell, acc, depth) => {
    // only collect leaf nodes/cells at max. depth
    if (depth >= 9) {
        acc.push(cell)
        return acc
    }
    // choose (normalized) split position
    const t = SYSTEM.minmax(0.25, 0.75)
    const [w, h] = cell.size
    depth++
    // split either horizontally or vertically
    // (based on current recursion depth)
    if (depth & 1) {
        // horizontal split
        subdiv(rect(cell.pos, [w * t, h]), acc, depth)
        subdiv(
            rect([cell.pos[0] + w * t, cell.pos[1]], [w * (1 - t), h]),
            acc,
            depth
        )
    } else {
        // vertical split
        subdiv(rect(cell.pos, [w, h * t]), acc, depth)
        subdiv(
            rect([cell.pos[0], cell.pos[1] + h * t], [w, h * (1 - t)]),
            acc,
            depth
        )
    }
    return acc
}
export { subdiv }
