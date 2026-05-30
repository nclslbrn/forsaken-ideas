const { random, round } = Math

export const randPartition = (parts, size) => {
    const rands = Array.from(Array(parts)).map(() => random())
    const sum = rands.reduce((sum, val) => sum + val, 0)
    return rands.map((x) => round((x / sum) * size))
}

export const partitionColor = (i, partition) =>
    partition.reduce(
        (colorRange, length, colIdx) => [
            i >= colorRange[1] && i <= length + colorRange[0]
                ? colIdx
                : colorRange[0],
            colorRange[1] + length
        ],
        [0, 0]
    )[0]
