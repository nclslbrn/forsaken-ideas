const { atan2, PI } = Math
export default function (pts) {
    const center = [
        pts.reduce((sum, pt) => sum + pt[0], 0) / pts.length,
        pts.reduce((sum, pt) => sum + pt[1], 0) / pts.length
    ]

    return pts.sort(
        (a, b) =>
            (atan2(a[1] - center[1], a[0] - center[0]) % (PI * 2)) -
            (atan2(b[1] - center[1], b[0] - center[0]) % (PI * 2))
    )
}
