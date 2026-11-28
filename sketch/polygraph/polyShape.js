const EPS = 1e-6

const signedArea = (pts) => {
    let s = 0
    for (let i = 0, n = pts.length; i < n; i++) {
        const a = pts[i],
            b = pts[(i + 1) % n]
        s += a[0] * b[1] - b[0] * a[1]
    }
    return s / 2
}

// drop consecutive duplicate points (cuts through a vertex create them)
const dedupe = (pts) =>
    pts.filter((p, i) => {
        const q = pts[(i + 1) % pts.length]
        return Math.hypot(q[0] - p[0], q[1] - p[1]) > EPS
    })

/** Mitered inset of a simple polygon. Returns null if the piece collapses. */
export const inset = (pts, dist, miter = 0.1) => {
    const src = dedupe(pts)
    const n = src.length
    if (n < 3) return null
    const area = signedArea(src)
    const sgn = area > 0 ? 1 : -1

    // inward unit normal of edge a→b
    const norm = (a, b) => {
        const dx = b[0] - a[0],
            dy = b[1] - a[1],
            l = Math.hypot(dx, dy)
        return [(-dy / l) * sgn, (dx / l) * sgn]
    }

    const out = src.map((cur, i) => {
        const prev = src[(i + n - 1) % n],
            next = src[(i + 1) % n]
        const n1 = norm(prev, cur),
            n2 = norm(cur, next)
        const k = dist / Math.max(1 + n1[0] * n2[0] + n1[1] * n2[1], miter)
        return [cur[0] + (n1[0] + n2[0]) * k, cur[1] + (n1[1] + n2[1]) * k]
    })

    const a2 = signedArea(out)
    // must keep orientation, and actually be smaller
    return a2 * area > 0 && Math.abs(a2) > 1 && Math.abs(a2) < Math.abs(area)
        ? out
        : null
}

/** Rounds every corner with a quadratic Bézier (control point = the vertex). */
export const roundCorners = (pts, radius, steps = 8) => {
    const n = pts.length
    const out = []
    for (let i = 0; i < n; i++) {
        const prev = pts[(i + n - 1) % n],
            cur = pts[i],
            next = pts[(i + 1) % n]
        const l1 = Math.hypot(prev[0] - cur[0], prev[1] - cur[1])
        const l2 = Math.hypot(next[0] - cur[0], next[1] - cur[1])
        // never more than half an edge, so neighbouring arcs don't overlap
        const r1 = Math.min(radius, l1 / 2) / l1
        const r2 = Math.min(radius, l2 / 2) / l2
        const a = [
            cur[0] + (prev[0] - cur[0]) * r1,
            cur[1] + (prev[1] - cur[1]) * r1
        ]
        const b = [
            cur[0] + (next[0] - cur[0]) * r2,
            cur[1] + (next[1] - cur[1]) * r2
        ]
        for (let s = 0; s <= steps; s++) {
            const t = s / steps,
                u = 1 - t
            out.push([
                u * u * a[0] + 2 * u * t * cur[0] + t * t * b[0],
                u * u * a[1] + 2 * u * t * cur[1] + t * t * b[1]
            ])
        }
    }
    return out
}
