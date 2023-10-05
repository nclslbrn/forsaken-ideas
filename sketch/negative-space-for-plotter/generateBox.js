import { isInOneRect } from './inRect'
import { rect } from '@thi.ng/geom'

const generateBox = (margin, width, height, factor, size, rects) => {
    const boxes = []
    for (let x = margin; x < width - margin; x += size) {
        for (let y = margin + size; y < height - margin; y += size) {
            if ((x ^ y) % factor) {
                const box = rect([x, y], [size, size])
                if (!isInOneRect([x + size / 2, y + size / 2], rects)) {
                    boxes.push(box)
                }
            }
        }
    }
    return boxes
}

export { generateBox }
