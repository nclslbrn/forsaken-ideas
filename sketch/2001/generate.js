import Fbm from './Fbm'

const generateHeight = (width, height, seed) => {
    const size = width * height,
        data = new Uint8Array(size),
        fbm = new Fbm({
            frequency: 0.03,
            octaves: 7,
            amplitude: 0.25,
            seed: seed
        }),
        z = Math.random() * 100

    let quality = 1
    const buildSize = 3
    const middle = { x: width / 2, y: height / 2 }

    for (let j = 0; j < 4; j++) {
        for (let i = 0; i < size; i++) {
            const x = i % width,
                y = ~~i / width

            if (
                Math.abs(middle.x - x) <= buildSize &&
                Math.abs(middle.y - y) <= buildSize
            ) {
                data[i] = data.reduce((accumulator, currentValue) =>
                    Math.max(accumulator, currentValue)
                )
            } else {
                data[i] += Math.abs(
                    fbm.f(x / quality, y / quality, z) * quality * 1.75
                )
            }
        }
        quality *= 5
    }
    return data
}

export { generateHeight }
