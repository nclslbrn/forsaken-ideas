import { polygon, line } from '@thi.ng/geom'
import { createNoise2D } from 'simplex-noise'
import { SYSTEM } from '@thi.ng/random'

const polyFromTopAndBottom = (top, bottom, ground, colors, yID) => {
    return polygon(
        [
        ...top.map((p) => [p[0], p[1] - ground / 2]),
        ...bottom.reverse().map((p) => [p[0], p[1] + ground / 2])
    ],
    {
        fill: colors[yID % colors.length],
        stroke: '#333'
    })
}

const generatePolygon = (
    step,
    scale,
    ground,
    margin,
    decay,
    width,
    height,
    colors
) => {
    const polys = [],
        lines = [],
        noise2D = createNoise2D()

    let drawWithLine = false,
        yID = 0

    for (let y = margin; y < height - margin; y += step) {
        let top = [],
            bottom = []

        for (let x = margin; x < width - margin; x += 3) {
            const n1 = noise2D((x / height) * step * scale, decay)
            const n2 = noise2D((y / height) * step * scale, decay)
            const p1 = [x, y + Math.min(step / 4, n1 * step * 0.5)]
            const p2 = [x, y + Math.min(step / 4, n2 * step * 0.5)]
            
            if (drawWithLine) {
                lines.push(line(p1, p2))
            } else {
                if (p1[1] < p2[1]) {
                    top.push(p1)
                    bottom.push(p2)
                } else {
                    top.push(p2)
                    bottom.push(p1)
                }
            }
            if (SYSTEM.float() > 0.95) {
                if (!drawWithLine) {
                    polys.push(polyFromTopAndBottom(top, bottom, ground, colors, yID))
                    top = []
                    bottom = []
                    x += ground
                }
                drawWithLine = !drawWithLine
            }  
        }
        if (!drawWithLine) {
            polys.push(polyFromTopAndBottom(top, bottom, ground, colors, yID))
        }
        
        yID++
    }

    return [polys, lines]
}

export { generatePolygon }
