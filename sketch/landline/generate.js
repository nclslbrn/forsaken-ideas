import * as THREE from 'three'
import Fbm from './Fbm'

const generateHeight = (width, height) => {
    const size = width * height,
        data = new Uint8Array(size),
        fbm = new Fbm({
            frequency: 0.03,
            octaves: 7,
            amplitude: 0.25,
            seed: Math.random()
        }),
        z = Math.random() * 100

    let quality = 1

    for (let j = 0; j < 4; j++) {
        for (let i = 0; i < size; i++) {
            const x = i % width,
                y = ~~i / width

            data[i] += Math.abs(
                fbm.f(x / quality, y / quality, z) * quality * 1.75
            )
        }
        quality *= 5
    }
    return data
}

export { generateHeight }
