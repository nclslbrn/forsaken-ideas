import { polygon } from '@thi.ng/geom'

/** Retourne true si le polygone est convexe (tous les produits vectoriels de même signe). */
export const isConvex = (pts) => {
    const n = pts.length
    let sign = 0
    for (let i = 0; i < n; i++) {
        const a = pts[i],
            b = pts[(i + 1) % n],
            c = pts[(i + 2) % n]
        const z = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0])
        if (z !== 0) {
            const s = Math.sign(z)
            if (sign && s !== sign) return false
            sign = s
        }
    }
    return true
}

/** Boîte englobante [min, max] */
const extent = (pts) => {
    const min = [Infinity, Infinity],
        max = [-Infinity, -Infinity]
    for (const [x, y] of pts) {
        if (x < min[0]) min[0] = x
        if (y < min[1]) min[1] = y
        if (x > max[0]) max[0] = x
        if (y > max[1]) max[1] = y
    }
    return { min, max }
}

/**
 * Coupe un polygone simple par la droite {axe = c} (axis 0 : x = c, axis 1 : y = c).
 * Retourne la liste de tous les sous-polygones (tableaux de points).
 */
export const splitAxis = (pts, axis, c) => {
    const k = axis,
        o = 1 - axis
    const n = pts.length

    // 1. Anneau avec insertion des points d'intersection
    const ring = []
    for (let i = 0; i < n; i++) {
        const a = pts[i],
            b = pts[(i + 1) % n]
        const da = a[k] - c,
            db = b[k] - c
        ring.push({ p: a })
        if (da >= 0 !== db >= 0) {
            const t = da / (da - db)
            const p = [0, 0]
            p[k] = c
            p[o] = a[o] + t * (b[o] - a[o])
            ring.push({ p, cross: true, enter: db >= 0 }) // enter = on entre côté >= c
        }
    }
    const crossings = ring.filter((r) => r.cross)
    if (!crossings.length) return [pts] // rien à couper

    // 2. Appariement le long de la droite : (0,1), (2,3)... = cordes à l'intérieur de la forme
    const sorted = [...crossings].sort((u, v) => u.p[o] - v.p[o])
    const partner = new Map()
    for (let i = 0; i + 1 < sorted.length; i += 2) {
        partner.set(sorted[i], sorted[i + 1])
        partner.set(sorted[i + 1], sorted[i])
    }
    ring.forEach((r, i) => (r.i = i))

    // 3. Reconstruction : longer le contour, puis sauter le long de la corde
    const trace = (startEnter) => {
        const result = []
        const used = new Set()
        for (const s of crossings) {
            if (s.enter !== startEnter || used.has(s)) continue
            const poly = []
            let node = s
            while (node && !used.has(node)) {
                used.add(node)
                let i = node.i
                poly.push(ring[i].p)
                do {
                    i = (i + 1) % ring.length
                    poly.push(ring[i].p)
                } while (!ring[i].cross)
                node = partner.get(ring[i])
            }
            result.push(poly)
        }
        return result
    }

    return [...trace(true), ...trace(false)]
}

/** Segment aléatoire : un axe tiré au hasard, l'autre couvre [min, max] du polygone */
export const randomSplit = (pts, rnd = Math.random) => {
    const theta = rnd() * Math.PI
    const d = [Math.cos(theta), Math.sin(theta)] // cut direction
    const n = [-d[1], d[0]] // normal

    // rotated frame: q = [u along the cut, v across it]
    const q = pts.map(([x, y]) => [x * d[0] + y * d[1], x * n[0] + y * n[1]])
    const back = ([u, v]) => [u * d[0] + v * n[0], u * d[1] + v * n[1]]

    const { min, max } = extent(q)
    // 0.2–0.8 instead of 0.05–0.95 to avoid thin slivers
    const c = min[1] + (0.2 + 0.6 * rnd()) * (max[1] - min[1])

    return {
        segment: [back([min[0], c]), back([max[0], c])],
        parts: splitAxis(q, 1, c).map((poly) => poly.map(back))
    }
}
