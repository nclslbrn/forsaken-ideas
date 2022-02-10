export default function (line, step) {
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
        const lineLength = Math.random() * step * 0.3
        const next = [
            prev[0] + Math.cos(angle) * lineLength,
            prev[1] + Math.sin(angle) * lineLength
        ]
        if (r + lineLength < size) dashLine.push([[prev, next]])

        // little jump between lines
        const jumpLenght = Math.random() * step * 0.001
        prev = next
        prev[0] += Math.cos(angle) * jumpLenght
        prev[1] += Math.sin(angle) * jumpLenght
        r += jumpLenght + lineLength
    }
    return dashLine
}
