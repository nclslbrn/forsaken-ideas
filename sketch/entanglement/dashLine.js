/**
 * Create dash along a line
 * @param {Array} line [[x1, y1], [x2, y2]]
 * @param {Number} step maximum dash length
 * @param {Number} mode 0: straight 1: random
 *
 * @returns {Array} of multiple line
 */
export default function (line, step, mode) {
    const angle = Math.atan2(line[1][1] - line[0][1], line[1][0] - line[0][0])
    const size = Math.sqrt(
        Math.abs(line[1][0] - line[0][0]) ** 2 +
        Math.abs(line[1][1] - line[0][1]) ** 2
    )

    let r = 0,
        prev = line[0]
    const dashLine = []

    while (r < size) {
        // random line length
        let lineLength = step * (mode === 0 ? 0.15 : 0.3 * Math.random())

        // lineLenght too long
        if (r + lineLength > size) lineLength = size - r

        const next = [
            prev[0] + Math.cos(angle) * lineLength,
            prev[1] + Math.sin(angle) * lineLength
        ]
        dashLine.push([[prev, next]])

        // little jump between lines
        const jumpLenght = step * (mode === 0 ? 0.15 : 0.15 * Math.random())
        prev = [...next]
        prev[0] += Math.cos(angle) * jumpLenght
        prev[1] += Math.sin(angle) * jumpLenght
        r += jumpLenght + lineLength
    }
    return dashLine
}
