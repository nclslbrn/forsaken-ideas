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
            Math.abs(poly.points[i][0] - point[0]) < threshold &&
            Math.abs(poly.points[i][1] - point[1]) < threshold
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
        if (i !== polyIdx && isPointInPoly(point, polys[i], 0.7)) {
            return true
        }
    }

    return false
}

self.addEventListener('message', function (e) {
    const input = [...e.data]
    let isComputionalComplete = false

    function removeOverlapping(input) {
        try {
            let out = []
            // For each poly
            for (let i = input.length - 1; i >= 0; i--) {
                // copy point
                const pts = [...input[i].points]
                // is current point exist in another line
                let wasDouble = pointAlreadyExist(pts[0], input, i),
                    // unique points line
                    line = []

                // for each point on the line
                for (let j = 1; j < pts.length; j++) {
                    // is point unique
                    let isDouble = pointAlreadyExist(pts[j], input, i)
                    // if previous unique but current double
                    if (!wasDouble && isDouble && line.length > 1) {
                        // end the line (with previous uniques points)
                        out.push([line, input[i].attribs])
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

                    self.postMessage({
                        type: 'progress',
                        progress: Math.round((1 - i / input.length) * 100)
                    })
                }
                // if remainingf unique points save a new line
                if (line.length > 1) out.push([line, input[i].attribs])
                // remove the current line from the reference
                input.slice(i, 0)
            }
            isComputionalComplete = true
            return out
        } catch (error) {
            self.postMessage({ type: 'error', error: error.message })
            throw error
        }
    }

    const computationalResult = removeOverlapping(input)

    function checkCompletionAndSendResult() {
        if (isComputionalComplete) {
            self.postMessage({
                type: 'result',
                lines: computationalResult
            })
        } else {
            setTimeout(checkCompletionAndSendResult, 100)
        }
    }

    checkCompletionAndSendResult()
})

// Handle potential termination
self.addEventListener('error', function (e) {
    self.postMessage({
        type: 'error',
        error: e.message
    })
})
