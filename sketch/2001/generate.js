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
    const middle = { x: width / 2, y: height / 2 }

    const buildSize = 3
    const buildHeight = []
    for (let k = 0; k < buildSize ** 2; k++) {
        buildHeight.push(-2 + Math.random())
    }

    for (let j = 0; j < 6; j++) {
        for (let i = 0; i < size; i++) {
            const x = i % width,
                y = ~~i / width

            if (
                Math.abs(middle.x - x + 1) <= buildSize &&
                Math.abs(middle.y - y + 1) <= buildSize
            ) {
                const higherPoint = data.reduce((accumulator, currentValue) =>
                    Math.max(accumulator, currentValue)
                )
                const buildElevation = buildHeight[i % buildHeight.length]
                data[i] = Math.abs(higherPoint + buildElevation)
            } else {
                data[i] += Math.abs(
                    fbm.f(x / quality, y / quality, z) * quality * 1.25
                )
            }
        }
        quality *= 3.5
    }
    return data
}

export { generateHeight }
