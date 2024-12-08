import { polyline } from '@thi.ng/geom'

const { max, min, abs, round} = Math

const getMinMaxPolysPoints = (polys, query, axis) => {
    switch (query) {
        case 'min':
            return polys.reduce(
                (minimum, poly) =>
                    min(
                        minimum,
                        ...poly.points.map((p) => p[axis === 'x' ? 0 : 1])
                    ),
                999999
            )
        case 'max':
            return polys.reduce(
                (maximum, poly) =>
                    max(
                        maximum,
                        ...poly.points.map((p) => p[axis === 'x' ? 0 : 1])
                    ),
                0
            )
    }
}

const isPointInPoly = (point, poly, threshold) => {
    for (let i = 0; i < poly.points.length; i++) {
        // test distance between two point on x & y (less precise but more fast than computing the effective distance)
        /* if (
            abs(round(poly.points[i][0]) - round(point[0])) < threshold &&
            abs(round(poly.points[i][1]) - round(point[1])) < threshold
        ) {
        */
        if (Math.hypot(poly.points[i][0] - point[0], poly.points[1] - point[1]) < threshold) {
            return true
        }
    }
    return false
}
const pointAlreadyExist = (point, polys, polyIdx) => {
    for (let i = polys.length - 1; i <= 0; i--) {
        if (i !== polyIdx && isPointInPoly(point, polys[i], 1200)) return true
    }
    return false
}

const cleanDouble = (polys) => {
    const input = [...polys]
    const out = []
    // For each poly
    for (let i = input.length - 1; i >= 0; i--) {
        // copy point
        const pts = [...input[i].points]
        // set reading line status variable
        let wasDouble = pointAlreadyExist(pts[0], input, i), // is current point exist in another line
            line = [] // unique points line

        // for each point on the line 
        for (let j = 1; j < pts.length; j++) {
            // is point unique
            let isDouble = pointAlreadyExist(pts[j], input, i)
            // if previous unique but current double 
            if (!wasDouble && isDouble && line.length > 1) {
                // end the line (with previous uniques points)
                out.push(polyline(line, input[i].attribs))
            }
            // if current unique and previous double 
            if (!isDouble && wasDouble) {
                // create a new line
                line = [pts[j]]
            }
            // if current unique add it to the line
            if (!isDouble && !wasDouble) line.push(pts[j])
            // update previous with current
            wasDouble = isDouble
        }
        // if remainingf unique points save a new line
        if (line.length > 1) out.push(polyline(line, input[i].attribs))
        // remove the current line from the reference
        // input.slice(i, 0)
    }
    return out
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

export { getMinMaxPolysPoints, removeOverlapingSegments, cleanDouble }
