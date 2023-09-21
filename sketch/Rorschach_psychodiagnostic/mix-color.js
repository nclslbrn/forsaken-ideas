const addCol = (col1, col2) => {
    return [
        Math.floor((col1[0] + col2[0]) / 2),
        Math.floor((col1[1] + col2[1]) / 2),
        Math.floor((col1[2] + col2[2]) / 2)
    ]
}
const darkenCol = (col1, col2) => {
    return [
        Math.min(col1[0], col2[0]),
        Math.min(col1[1], col2[1]),
        Math.min(col1[2], col2[2])
    ].map((channel) => (channel = channel > 10 ? channel - 10 : channel))
}

const lightenCol = (col1, col2) => {
    return [
        Math.max(col1[0], col2[0]),
        Math.max(col1[1], col2[1]),
        Math.max(col1[2], col2[2])
    ].map((channel) => (channel = channel < 245 ? channel + 10 : channel))
}
const multiplyCol = (col1, col2) => {
    return [
        Math.floor((col1[0] * col2[0]) / 255),
        Math.floor((col1[1] * col2[1]) / 255),
        Math.floor((col1[2] * col2[2]) / 255)
    ]
}
export default [multiplyCol, lightenCol, addCol, darkenCol]
