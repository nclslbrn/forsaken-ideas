import { createNoise2D } from 'simplex-noise'

const noiseLine = (
    step,
    scale,
    ground,
    margin,
    width,
    height,
    variation,
    dpr
) => {
    const noise2D = createNoise2D(),
        bands = []
    for (let y = margin[1] + step; y < height - margin[1]; y += step) {
        let top = [],
            bottom = []

        for (let x = margin[0]; x < width - margin[0]; x += dpr) {
            const n1 = noise2D(
                (x / width) * step * scale +
                    (variation === 0 ? (x + y) / width : 0),
                step * scale + (variation === 0 ? (x + y) / (width * 100) : 0)
            )
            const n2 = noise2D((y / height) * step * scale, step * scale * 10)

            const y1 = y + Math.min(step / 4, n1 * step * 0.4)
            const y2 = y + Math.min(step / 4, n2 * step * 0.4)

            if (y1 >= y2) {
                top.push([x, y2 - ground / 2])
                bottom.push([x, y1 + ground / 2])
            } else {
                top.push([x, y1 - ground / 2])
                bottom.push([x, y2 + ground / 2])
            }
        }
        bands.push([top, bottom])
    }
    return bands
}

export { noiseLine }
