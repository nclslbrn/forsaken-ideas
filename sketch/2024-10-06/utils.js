import { polyline } from '@thi.ng/geom'

const getMinMaxPolysPoints = (polys, query, axis) => {
    switch (query) {
        case 'min':
            return polys.reduce(
                (min, poly) =>
                    Math.min(
                        min,
                        ...poly.points.map((p) => p[axis === 'x' ? 0 : 1])
                    ),
                999999
            )
        case 'max':
            return polys.reduce(
                (max, poly) =>
                    Math.max(
                        max,
                        ...poly.points.map((p) => p[axis === 'x' ? 0 : 1])
                    ),
                0
            )
    }
}

const isPointInPoly = (point, poly, polyIdx) => {
    for (let i = 0; i < poly.points.length; i++) {
        if (poly.points[i] === point && i !== polyIdx) return true
    }
    return false
}

const removeOverlapingSegments = (polys) => {
    const out = [...polys]
    for (let i = out.length - 1; i >= 0; i--) {
        let points = out[i].points
        const unique = []
        // check if line start overlap another line
        if (
            out.reduce(
                (same, poly, idx) =>
                    same || isPointInPoly(points[0], poly, idx),
                false
            )
        ) {
            let overlaping = true
            // Follow the line until the two lines diverge
            for (let j = 1; j < points.length; j++) {
                overlaping =
                    overlaping &&
                    out.reduce(
                        (same, poly, idx) =>
                            same || isPointInPoly(points[j], poly, idx),
                        false
                    )
                // Copy points when lines diverge
                if (!overlaping) {
                    unique.push(points[j])
                }
            }
        }
        // check if line end overlap another line
        if (
            out.reduce(
                (same, poly, idx) =>
                    same || isPointInPoly(unique[unique.length - 1], poly, idx),
                false
            )
        ) {
            let overlaping = true
            for (let k = unique.length - 1; k >= 0; k++) {
                overlaping =
                    overlaping &&
                    out.reduce(
                        (same, poly, idx) =>
                            same || isPointInPoly(unique[k], poly, idx),
                        false
                    )
                if (overlaping) unique.splice(k, 1)
            }
        }
        out.splice(i, 1, polyline(unique))
    }
    return out
}

export { getMinMaxPolysPoints, removeOverlapingSegments }
