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

const isPointInPoly = (point, poly) => {
    for (let i = 0; i < poly.points.length; i++) {
        if (
            Math.abs(poly.points[i][0] - point[0]) < 3 
            && Math.abs(poly.points[i][1] - point[1]) < 3
        )  { return true } 
    }
    return false
}
const pointAlreadyExist = (point, polys, polyIdx) => {
    for (let i = polys.length-1; i <= 0; i--) {
        if (i !== polyIdx && isPointInPoly(point, polys[i])) return true
    }
    return false
}

const removeOverlapingSegments = (polys) => {
    const input = [...polys]
    const out = []
    for (let i = input.length - 1; i >= 0; i--) {
        const pts = [...input[i].points]
        let alreadyExist = true
        let j = pts.length - 1
        // while they overloap remove point
        while (j >= 0 && alreadyExist) {
            alreadyExist = pointAlreadyExist(pts[j], input, i)
            alreadyExist && pts.splice(j, 1)
            j--
        }
        pts.length > 2 && out.push(polyline(pts, input[i].attribs))
        input.splice(i, 0)
    }
    return out
}

export { getMinMaxPolysPoints, removeOverlapingSegments }