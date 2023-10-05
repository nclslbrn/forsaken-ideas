import { rect } from '@thi.ng/geom'
import { map } from '../../sketch-common/Math'

const getDistribution = (maxItems) => {
    let items = []
    for (let i = 1; i <= maxItems; i++) {
        items.push(Math.random())
    }
    const sum = items.reduce((acc, val) => (acc += val))
    return items.map((val) => (val /= sum))
}

const generateRect = (rectPerColRow, margin, width, height) => {
    const rects = []

    const heights = getDistribution(rectPerColRow).map((v) =>
        map(v, 0, 1, margin, height - margin)
    )

    let dy = margin

    for (const h of heights) {
        const widths = getDistribution(rectPerColRow).map((v) =>
            map(v, 0, 1, margin, width - margin)
        )
        let dx = margin

        for (const w of widths) {
            rects.push(rect([dx, dy], [w, h]))
            dx += w
        }
        dy += h
    }
    return rects
    /*
    while (rects.length < numRect) {
        const size = [
            Math.round(SYSTEM.minmax(0.05, 0.2) * width),
            Math.round(SYSTEM.minmax(0.05, 0.2) * height)
        ]

        const newRect = rect(
            [
                SYSTEM.minmaxInt(
                    margin + size[0] / 2,
                    width - (margin + size[0] / 2)
                ),
                SYSTEM.minmaxInt(
                    margin + size[1] / 2,
                    height - (margin + size[1] / 2)
                )
            ],
            size
        )

        if (!isRectInRect(newRect, rects)) {
            rects.push(newRect)
        }
    }
    return rects
    */
}

export { generateRect }
