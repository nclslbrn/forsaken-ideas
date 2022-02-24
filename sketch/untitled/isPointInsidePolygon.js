/**
 * Determine if point is in poly
 * @param {object} p the {x,y} position of the point
 * @param {array} polygon a list of polygon points
 * @returns {boolean}
 */
export default function (p, polygon) {
    var isInside = false
    var minX = polygon[0].x,
        maxX = polygon[0].x
    var minY = polygon[0].y,
        maxY = polygon[0].y
    for (var n = 1; n < polygon.length; n++) {
        var q = polygon[n]
        minX = Math.min(q.x, minX)
        maxX = Math.max(q.x, maxX)
        minY = Math.min(q.y, minY)
        maxY = Math.max(q.y, maxY)
    }

    if (p.x < minX || p.x > maxX || p.y < minY || p.y > maxY) {
        return false
    }

    var i = 0,
        j = polygon.length - 1
    for (i, j; i < polygon.length; j = i++) {
        if (
            polygon[i].y > p.y != polygon[j].y > p.y &&
            p.x <
                ((polygon[j].x - polygon[i].x) * (p.y - polygon[i].y)) /
                    (polygon[j].y - polygon[i].y) +
                    polygon[i].x
        ) {
            isInside = !isInside
        }
    }

    return isInside
}
