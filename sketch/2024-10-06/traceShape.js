const iso = (pt, center) => [
    center[0] + pt[0] - pt[1],
    center[1] * 1.2 + (pt[0] + pt[1]) / 2
]
const HALF_PI = Math.PI * 0.5

const traceShape = (shape, center) => {
    const shpStart = [
        shape.center[0] - (shape.size[0] / 2) * Math.cos(shape.rot),
        shape.center[1] - (shape.size[1] / 2) * Math.sin(shape.rot)
    ]
    const shpEnd = [
        shape.center[0] + (shape.size[0] / 2) * Math.cos(shape.rot),
        shape.center[1] + (shape.size[1] / 2) * Math.sin(shape.rot)
    ]
    // Then create a path around it
    const shapePts = [
        [
            shpStart[0] + Math.cos(shape.rot - HALF_PI) * shape.size[1],
            shpStart[1] + Math.sin(shape.rot - HALF_PI) * shape.size[1]
        ],
        [
            shpEnd[0] + Math.cos(shape.rot - HALF_PI) * shape.size[1],
            shpEnd[1] + Math.sin(shape.rot - HALF_PI) * shape.size[1]
        ],
        [
            shpEnd[0] + Math.cos(shape.rot + HALF_PI) * shape.size[1],
            shpEnd[1] + Math.sin(shape.rot + HALF_PI) * shape.size[1]
        ],
        [
            shpStart[0] + Math.cos(shape.rot + HALF_PI) * shape.size[1],
            shpStart[1] + Math.sin(shape.rot + HALF_PI) * shape.size[1]
        ]
    ]
    const base = shapePts.map((pt) => iso(pt, center))
    // Find the highest point of the shape
    const highestPt = [...base].sort((a, b) => a.y - b.y)[0]
    const highestPtId = base.indexOf(highestPt)
    // And build sides from it
    const bottom = []
    for (let i = 0; i < 4; i++) {
        const pt = base[(highestPtId + i) % base.length]
        bottom.push(pt)
    }
    const top = bottom.map((pt) => [pt[0], pt[1] - shape.height])
    return {
        bottom: bottom,
        left: [top[3], top[2], bottom[2], bottom[3]],
        right: [top[2], top[1], bottom[1], bottom[2]],
        top: top,
        height: shape.height
    }
}

export { traceShape }
