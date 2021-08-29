export default function (line) {
    const edgeValues = []
    for (let i = 0; i < line.length; i++) {
        const j = i !== line.length - 1 ? i + 1 : 0
        edgeValues.push((line[j][0] - line[i][0]) * (line[j][1] + line[i][1]))
    }
    const result = edgeValues.reduce((acc, curr) => acc + curr)
    return result > 0
}
