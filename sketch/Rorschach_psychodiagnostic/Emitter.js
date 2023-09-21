import mix from './mix-color'

export default class Emitter {
    constructor(
        frequency,
        turbulence,
        palette,
        dot,
        p5
    ) {
        this.frequency = frequency
        this.turbulence = turbulence
        this.palette = palette
        this.dot = dot
        this.p5 = p5
    }

    spread(pos, color, length, pId) {
        const bottomP5jsCol = this.p5.get(pos[0], pos[1])
        const bottomCol = [this.p5.red(bottomP5jsCol), this.p5.green(bottomP5jsCol), this.p5.blue(bottomP5jsCol)]
        const multCol = mix[pId % mix.length](bottomCol, this.palette[color])

        for (let i = 1; i < length; i++) {
            const n = this.p5.noise(
                pId + pos[0] * this.frequency,
                pId + pos[1] * this.frequency
            )
            const nD = n * Math.PI + pId * Math.PI
            const d = this.p5.noise(
                pId + Math.cos(nD),
                pId + Math.sin(nD)
            )

            const angle = n * this.turbulence
            const size = this.p5.map(d * i, -length, length, 5, 1)

            const pd = size
            this.dot(pos, size, multCol)
            pos[0] += Math.cos(angle) * pd
            pos[1] += Math.sin(angle) * pd
        }
		this.p5.updatePixels()
    }
}
