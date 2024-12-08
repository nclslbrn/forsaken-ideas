import { polyline } from '@thi.ng/geom'

const { max, min, abs, round, hypot } = Math
/**
 * Compute polylines bound/rectangle value
 * @param {array} polys a list of polyline
 * @param {min|max} query define which limit query
 * @param {x|y} axis define the axe to search
 */
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
/**
 * Test if point is near ones of a polygon
 * @param {array|Vec} a 2D coordinate
 * @param {Object|Polyline} a polyline
 * @param {number} threshold minimal distance between to consider overlap occurs
 */
const isPointInPoly = (point, poly, threshold) => {
    for (let i = 0; i < poly.points.length; i++) {
        // test distance between two point on x & y (less precise but more fast than computing the effective distance)
        if (
            abs(poly.points[i][0] - point[0]) < threshold &&
            abs(poly.points[i][1] - point[1]) < threshold
            // accurate version
            //hypot(poly.points[i][0] - point[0], poly.points[1] - point[1]) < threshold
        ) {
            return true
        }
    }
    return false
}

/**
 * Test if point is near to another
 * @param {Array|Vec} point 2d coordinate
 * @param {Array} a list of polyline
 * @param {number} the ID of the point polyline (index of polys)
 */
const pointAlreadyExist = (point, polys, polyIdx) => {
    if (point === undefined) return true
    for (let i = polys.length - 1; i >= 0; i--) {
        if (i !== polyIdx && isPointInPoly(point, polys[i], 0.5)) {
            return true
        }
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
        input.slice(i, 0)
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
