const { cos, sin } = Math
const matrixFromEuler = (x, y, z) => {
    // Create individual rotation matrices
    const rx = [1, 0, 0, 0, cos(x), -sin(x), 0, sin(x), cos(x)]

    const ry = [cos(y), 0, sin(y), 0, 1, 0, -sin(y), 0, cos(y)]

    const rz = [cos(z), -sin(z), 0, sin(z), cos(z), 0, 0, 0, 1]

    // Combine rotations: Z * Y * X
    const temp = new Array(9)
    const result = new Array(9)

    // Multiply rz * ry
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            temp[i * 3 + j] =
                rz[i * 3] * ry[j] +
                rz[i * 3 + 1] * ry[3 + j] +
                rz[i * 3 + 2] * ry[6 + j]
        }
    }

    // Multiply (rz * ry) * rx
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            result[i * 3 + j] =
                temp[i * 3] * rx[j] +
                temp[i * 3 + 1] * rx[3 + j] +
                temp[i * 3 + 2] * rx[6 + j]
        }
    }

    return result
}


export { matrixFromEuler }
