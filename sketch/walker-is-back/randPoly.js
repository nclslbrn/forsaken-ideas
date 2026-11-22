import { repeatedly } from '@thi.ng/transducers'

const { PI, sin, cos } = Math
// distance from c to the inner rectangle edge, along angle a
const rayToRect = ([cx, cy], [[minX, maxX], [minY, maxY]], a) => {
    const dx = Math.cos(a),
        dy = Math.sin(a)
    const tx = dx > 0 ? (maxX - cx) / dx : dx < 0 ? (minX - cx) / dx : Infinity
    const ty = dy > 0 ? (maxY - cy) / dy : dy < 0 ? (minY - cy) / dy : Infinity
    return Math.min(tx, ty)
}

// create point along rotattion
export const randPoly = (center, bounds, numPoints, RND) => {
    const offset = RND.float(Math.PI * 2)
    return [
        ...repeatedly((k) => {
            // evenly spaced angles + jitter (< half a gap, so the order is kept
            // and the polygon never self-intersects)
            const a =
                offset + ((k + RND.minmax(-0.3, 0.3)) / numPoints) * PI * 2
            // 1 = on the inner rectangle edge
            const r = rayToRect(center, bounds, a) * RND.minmax(0.6, 1)
            return [center[0] + cos(a) * r, center[1] + sin(a) * r]
        }, numPoints)
    ]
}
