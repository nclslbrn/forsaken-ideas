const diff = (num1, num2) => (num1 > num2 ? num1 - num2 : num2 - num1)
/**
 * From two point of Bézier curve get a list of point linearly interpolated
 * @param t between 0 and 1 where interpolation occurs
 * @param sx first point x
 * @param sy first point y
 * @param cp1x first control point x
 * @param cp1y first control point y
 * @param ex end point x
 * @param ey end point y
 */
const flattenSingleCurve = (t, sx, sy, cp1x, cp1y, ex, ey) => [
    (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cp1x + t * t * ex,
    (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cp1y + t * t * ey
]

const flattenBezier = (path) => {
    const flatten = []
    flatten.push(path[0])
    for (let i = 1; i < path.length - 1; i++) {
        const p1 = path[i],
            p2 = path[i + 1]
        // Distance of the ditribution
        const deltaX = diff(p1[0], p2[0])
        const deltaY = diff(p1[1], p2[1])
        const dist = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))
        for (let j = 0; j < dist; j += 2) {
            flatten.push(
                flattenSingleCurve(
                    j / dist,
                    path[i][0],
                    path[i][1],
                    path[i][2],
                    path[i][3],
                    path[i][4],
                    path[i][5]
                )
            )
        }
    }
    flatten.push(path[path.length - 1])
    return flatten
}


export { flattenBezier }
