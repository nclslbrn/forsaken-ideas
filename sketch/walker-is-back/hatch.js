import { distSq2 } from '@thi.ng/vectors'

/**
 * Parallel hatch lines at `angle`, clipped to ANY simple polygon
 * (concave included). Returns an array of [a, b] segments.
 */
export const hatchLines = (pts, angle, step) => {
    const d = [Math.cos(angle), Math.sin(angle)]
    const n = [-d[1], d[0]]
    // rotated frame: u along the lines, v across them
    const q = pts.map(([x, y]) => [x * d[0] + y * d[1], x * n[0] + y * n[1]])
    const back = ([u, v]) => [u * d[0] + v * n[0], u * d[1] + v * n[1]]

    let vMin = Infinity,
        vMax = -Infinity
    for (const [, v] of q) {
        if (v < vMin) vMin = v
        if (v > vMax) vMax = v
    }

    const segs = []
    for (let c = vMin + step / 2; c < vMax; c += step) {
        // crossings of the scanline v = c with every edge
        const us = []
        for (let i = 0; i < q.length; i++) {
            const a = q[i],
                b = q[(i + 1) % q.length]
            if (a[1] >= c !== b[1] >= c) {
                us.push(a[0] + ((c - a[1]) / (b[1] - a[1])) * (b[0] - a[0]))
            }
        }
        us.sort((x, y) => x - y)
        // pairs (0,1), (2,3)... are the inside spans
        for (let i = 0; i + 1 < us.length; i += 2) {
            if (us[i + 1] - us[i] > 1) {
                segs.push([back([us[i], c]), back([us[i + 1], c])])
            }
        }
    }
    return segs
}

/**
 * Join segments into continuous back-and-forth paths (fewer pen lifts).
 * A new path is started when the next segment is too far away, which
 * happens on concave shapes: no connector is drawn across empty space.
 */
export const serpentine = (segs, maxGap) => {
    const maxSq = maxGap * maxGap
    const paths = []
    let cur = null
    for (const [a, b] of segs) {
        if (cur) {
            const end = cur[cur.length - 1]
            const dA = distSq2(end, a),
                dB = distSq2(end, b)
            if (Math.min(dA, dB) < maxSq) {
                cur.push(...(dA <= dB ? [a, b] : [b, a]))
                continue
            }
        }
        cur = [a, b]
        paths.push(cur)
    }
    return paths
}

/** Greedy nearest-neighbour ordering (paths may be reversed) to cut pen travel */
export const sortPaths = (list) => {
    const todo = [...list]
    const out = []
    let cur = [0, 0]
    while (todo.length) {
        let best = 0,
            bestD = Infinity,
            rev = false
        for (let i = 0; i < todo.length; i++) {
            const p = todo[i]
            const d0 = distSq2(cur, p[0])
            const d1 = distSq2(cur, p[p.length - 1])
            if (d0 < bestD) [bestD, best, rev] = [d0, i, false]
            if (d1 < bestD) [bestD, best, rev] = [d1, i, true]
        }
        const p = todo.splice(best, 1)[0]
        const q = rev ? [...p].reverse() : p
        out.push(q)
        cur = q[q.length - 1]
    }
    return out
}
