function areCollinding(p1, p2, p3, p4) {
    var det, gamma, lambda
    det = (p2[0] - p1[0]) * (p4[1] - p3[1]) - (p4[0] - p3[0]) * (p2[1] - p1[1])
    if (det === 0) {
        return false
    } else {
        lambda =
            ((p4[1] - p3[1]) * (p4[0] - p1[0]) +
                (p3[0] - p4[0]) * (p4[1] - p1[1])) /
            det
        gamma =
            ((p1[1] - p2[1]) * (p4[0] - p1[0]) +
                (p2[0] - p1[0]) * (p4[1] - p1[1])) /
            det
        return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1
    }
}

function getLineLineCollision(p1, p2, p3, p4) {
    if (!areCollinding(p1, p2, p3, p4)) return false

    const ua =
        ((p4[0] - p3[0]) * (p1[1] - p3[1]) -
            (p4[1] - p3[1]) * (p1[0] - p3[0])) /
        ((p4[1] - p3[1]) * (p2[0] - p1[0]) - (p4[0] - p3[0]) * (p2[1] - p1[1]))

    const x = p1[0] + ua * (p2[0] - p1[0])
    const y = p1[1] + ua * (p2[1] - p1[1])

    return [x, y]
}

export { getLineLineCollision }
