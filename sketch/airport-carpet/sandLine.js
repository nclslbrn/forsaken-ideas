export default function (from, to, initialcolor, p5) {
    let angle = Math.atan2(to.y - from.y, to.x - from.x)
    const size = Math.sqrt(
        Math.abs(to.x - from.x) ** 2 + Math.abs(to.y - from.y) ** 2
    )
    const alpha = p5.color(0, 0)
    const col = p5.color(initialcolor)

    for (let r = 0; r <= size; r++) {
        const rand = Math.random()
        const pos = {
            x: from.x + Math.cos(angle) * r,
            y: from.y + Math.sin(angle) * r
        }
        const c = p5.lerpColor(col, alpha, rand)
        p5.stroke(c)
        p5.point(pos.x, pos.y)
    }
}
