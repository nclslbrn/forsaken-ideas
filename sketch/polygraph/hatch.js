import { pickRandom } from '@thi.ng/random'
const { cos, sin, PI, hypot, abs } = Math

const rotateAround = ([x, y], [cx, cy], a) => {
    const c = cos(a),
        s = sin(a),
        dx = x - cx,
        dy = y - cy
    return [cx + dx * c - dy * s, cy + dx * s + dy * c]
}

const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]

/** Even-odd point-in-polygon test (works for concave polygons). */
const inside = ([x, y], poly) => {
    let res = false
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i],
            [xj, yj] = poly[j]
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
            res = !res
    }
    return res
}

/** Parameter t (0..1) along a->b where it crosses edge c->d, or null. */
const crossT = (a, b, c, d) => {
    const r = [b[0] - a[0], b[1] - a[1]],
        s = [d[0] - c[0], d[1] - c[1]],
        den = r[0] * s[1] - r[1] * s[0]
    if (abs(den) < 1e-12) return null
    const qp = [c[0] - a[0], c[1] - a[1]],
        t = (qp[0] * s[1] - qp[1] * s[0]) / den,
        u = (qp[0] * r[1] - qp[1] * r[0]) / den
    return t > 0 && t < 1 && u >= 0 && u <= 1 ? t : null
}

/** Clip a polyline to a polygon -> array of polylines. */
const clipPolyline = (line, poly) => {
    const out = []
    let cur = null
    for (let i = 0; i < line.length - 1; i++) {
        const a = line[i],
            b = line[i + 1]
        const ts = [0, 1]
        for (let k = 0; k < poly.length; k++) {
            const t = crossT(a, b, poly[k], poly[(k + 1) % poly.length])
            if (t !== null) ts.push(t)
        }
        ts.sort((x, y) => x - y)
        for (let j = 0; j < ts.length - 1; j++) {
            const t0 = ts[j],
                t1 = ts[j + 1]
            if (t1 - t0 < 1e-9) continue
            if (inside(lerp(a, b, (t0 + t1) / 2), poly)) {
                const p0 = lerp(a, b, t0),
                    p1 = lerp(a, b, t1)
                const last = cur && cur[cur.length - 1]
                if (last && hypot(last[0] - p0[0], last[1] - p0[1]) < 1e-6) {
                    cur.push(p1)
                } else {
                    cur = [p0, p1]
                    out.push(cur)
                }
            } else {
                cur = null
            }
        }
    }
    return out
}

/**
 * Wavy hatch layers clipped to any simple polygon.
 * @param pts       polygon points [[x,y], ...]
 * @param numLayer  number of independent layers (each has its own angle/wave)
 * @param step      spacing between lines: number or fn(t 0..1) => number
 * @param amplitude base wave amplitude (in px)
 * @param rand      thi.ng IRandom
 * @param settings     { ptPerLine: [min,max], amplitude: [min,max] }
 * @returns array (per layer) of arrays of polylines
 */
export const buildWavyHatch = (
    pts,
    numLayer,
    step,
    amplitude,
    rand,
    settings
) => {
    const stepAt = typeof step === 'function' ? step : () => step

    // bounding circle of the polygon, so any angle fully covers it
    const xs = pts.map((p) => p[0]),
        ys = pts.map((p) => p[1])
    const minX = Math.min(...xs),
        maxX = Math.max(...xs)
    const minY = Math.min(...ys),
        maxY = Math.max(...ys)
    const center = [(minX + maxX) / 2, (minY + maxY) / 2]
    const len = hypot(maxX - minX, maxY - minY)
    const x0 = center[0] - len / 2
    const y0 = center[1] - len / 2

    return Array.from({ length: numLayer }, () => {
        const angle = pickRandom(settings.hatchAngle, rand)

        // wave profile shared by every line of this layer
        const stepNum = rand.minmaxInt(...settings.ptPerLine)
        const raw = Array.from({ length: stepNum }, () => rand.float() * 10)
        const sum = raw.reduce((a, b) => a + b, 0)
        const normSteps = raw.reduce(
            (acc, x) => [...acc, acc[acc.length - 1] + x / sum],
            [0]
        )
        const waveAmp = amplitude * rand.minmax(...settings.amplitude)
        const waveOffsets = normSteps.map(
            () => (rand.float() * 2 - 1) * waveAmp
        )

        const layer = []
        for (let c = stepAt(0) / 2; c < len; c += stepAt(c / len)) {
            const line = normSteps.map((t, idx) =>
                rotateAround(
                    [x0 + t * len, y0 + c + waveOffsets[idx]],
                    center,
                    angle
                )
            )
            layer.push(...clipPolyline(line, pts))
        }
        return layer
    })
}
