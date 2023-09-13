

function opposedLines (p1, p2) {
  const lengthX = p2.x - p1.x;
  const lengthY = p2.y - p1.y
  return {
    length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    angle: Math.atan2(lengthY, lengthX)
  }
}
function controlPoint (smoothing, current, previous, next, reverse = false) {
  // When 'current' is the first or last point of the array
  // 'previous' or 'next' don't exist.
  // Replace with 'current'
  const p = previous || current
  const n = next || current
  // Properties of the opposed-line
  const o = opposedLines(p, n)
  // If is end-control-point, add PI to the angle to go backward
  const angle = o.angle + (reverse ? Math.PI : 0)
  const length = o.length * smoothing
  // The control point position is relative to the current point
  const x = current.x + Math.cos(angle) * length
  const y = current.y + Math.sin(angle) * length
  return { x: x, y: y }
}
/**
 *
 * @param path a 2d array of 2d vector (x, y)
 * @returns smoothed a 2d array of 6d vector (cp1x, cp1y, cp2x, cp2y, p2x, p2y)
 */
function autoBezierCurve (path, smoothing = 0.2) {
  return path.map((pt, i, arr) => {
    if (i === 0) {
      return [pt, pt, pt]
    } else {
      // Start control point
      const cps = controlPoint(smoothing, arr[i - 1], arr[i - 2], pt)
      // End control point
      const cpe = controlPoint(smoothing, pt, arr[i - 1], arr[i + 1], true)

      return [cps, cpe, pt]
    }
  })
}

export { autoBezierCurve }
