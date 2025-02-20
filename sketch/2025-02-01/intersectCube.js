import { add, mul, sub, normalize } from './vectorOp'
import { matrixFromEuler } from './matrixFromEuler'
import { invert33 } from '@thi.ng/matrices'
const { min, max, abs, sign } = Math

const transformPoint = (matrix, point) => [
    point[0] * matrix[0] + point[1] * matrix[1] + point[2] * matrix[2],
    point[0] * matrix[3] + point[1] * matrix[4] + point[2] * matrix[5],
    point[0] * matrix[6] + point[1] * matrix[7] + point[2] * matrix[8]
]

const intersectCube = (origin, direction, cube) => {
    // Create rotation matrix and its inverse
    const rotMatrix = matrixFromEuler(...cube.rot)
    const invRotMatrix = invert33([], rotMatrix)

    // Transform ray to object space
    const rayOrigin = sub(origin, cube.center)
    const localOrigin = transformPoint(invRotMatrix, rayOrigin)
    const localDir = normalize(transformPoint(invRotMatrix, direction))

    const halfSize = cube.size / 2

    // Check intersection with axis-aligned box
    const tx1 = (-halfSize - localOrigin[0]) / localDir[0]
    const tx2 = (halfSize - localOrigin[0]) / localDir[0]
    const ty1 = (-halfSize - localOrigin[1]) / localDir[1]
    const ty2 = (halfSize - localOrigin[1]) / localDir[1]
    const tz1 = (-halfSize - localOrigin[2]) / localDir[2]
    const tz2 = (halfSize - localOrigin[2]) / localDir[2]

    const tmin = max(min(tx1, tx2), min(ty1, ty2), min(tz1, tz2))
    const tmax = min(max(tx1, tx2), max(ty1, ty2), max(tz1, tz2))

    if (tmax < 0 || tmin > tmax) {
        return null
    }

    const t = tmin < 0 ? tmax : tmin
    if (t < 0) {
        return null
    }

    // Calculate hit point and normal in object space
    const localHit = add(localOrigin, mul(localDir, t))

    // Determine which face was hit
    let localNormal = [0, 0, 0]
    const epsilon = 1e-4

    if (abs(abs(localHit[0]) - halfSize) < epsilon) {
        localNormal[0] = sign(localHit[0])
    } else if (abs(abs(localHit[1]) - halfSize) < epsilon) {
        localNormal[1] = sign(localHit[1])
    } else if (abs(abs(localHit[2]) - halfSize) < epsilon) {
        localNormal[2] = sign(localHit[2])
    }

    // Transform hit point and normal back to world space
    const worldHit = add(cube.center, transformPoint(rotMatrix, localHit))
    const worldNormal = normalize(transformPoint(rotMatrix, localNormal))

    return { t, hitPoint: worldHit, normal: worldNormal }
}

export { intersectCube }
