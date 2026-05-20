const { random, round } = Math

export const randPartition = (parts, size) => {
    const rands = Array.from(Array(parts)).map(() => random())
    const sum = rands.reduce((sum, val) => sum + val, 0)
    return rands.map((x) => round((x / sum) * size))
}
