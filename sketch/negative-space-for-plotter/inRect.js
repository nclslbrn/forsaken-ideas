const isInOneRect = (v, rects) => {
    for (let i = 0; i < rects.length; i++) {
        const r = rects[i]
        if (
            i % 2 === 0 &&
            v[0] > r.pos[0] &&
            v[0] < r.pos[0] + r.size[0] &&
            v[1] > r.pos[1] &&
            v[1] < r.pos[1] + r.size[1]
        ) {
            return true
        }
    }
    return false
}
const isRectInRect = (rect, rects) => {
    for (let i = 0; i < rects.length; i++) {
        const r = rects[i]
        const intersectionX1 = Math.max(rect.pos[0], r.pos[0])
        const intersectionX2 = Math.min(
            rect.pos[0] + r.size[0],
            r.pos[0] + r.size[0]
        )
        const intersectionY1 = Math.max(rect.pos[1], r.pos[1])
        const intersectionY2 = Math.min(
            rect.pos[1] + r.size[1],
            r.pos[1] + r.size[1]
        )

        if (
            i % 2 === 0 &&
            intersectionX2 > intersectionX1 &&
            intersectionY2 > intersectionY1
        ) {
            return true
        }
    }
    return false
}
export { isInOneRect, isRectInRect }
