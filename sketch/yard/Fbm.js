import { createNoise2D } from 'simplex-noise'

// FBM  https://thebookofshaders.com/13/

export default class Fbm {
    constructor(props = {}) {
        this.octaves = props.octaves === undefined ? 4 : props.octaves
        this.lacunarity =
            props.lacunarity === undefined ? 2.0 : props.lacunarity
        this.gain = props.gain === undefined ? 0.5 : props.gain

        this.amplitude = props.amplitude === undefined ? 0.8 : props.amplitude
        this.frequency = props.frequency === undefined ? 0.01 : props.frequency
        this.simplex = createNoise2D()
    }

    fbm (x, y, z) {
        let frequency = this.frequency
        let amplitude = this.amplitude

        // loop of octave
        const sa = Math.sin(0.5)
        const ca = Math.cos(0.5)
        let ox = 0,
            value = 0

        for (let i = 0; i < this.octaves; i++) {
            ox = x
            x = x * sa + y * ca
            y = -ox * ca + y * sa
            value +=
                amplitude *
                (-1.0 +
                    2.0 *
                    this.simplex(
                        frequency * x,
                        frequency * y,
                        frequency * z
                    ))
            frequency *= this.lacunarity
            amplitude *= this.gain
        }
        return value
    }
    f (x, y, z) {
        let tmp = this.fbm(x, y, z)
        tmp = this.fbm(x + 32 * tmp, y + 32 * tmp, z + 32 * tmp)
        tmp = this.fbm(x + 64 * tmp, y + 64 * tmp, z + 64 * tmp)
        return tmp
    }
}
