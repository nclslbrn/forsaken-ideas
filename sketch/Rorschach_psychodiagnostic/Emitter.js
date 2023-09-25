import mix from './mix-color'
import planeCurve from '../../sketch-common/plane-curve'

const functionNames = Object.keys(planeCurve)

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
        this.func = p5.random(functionNames)
    }

    spread(pos, color, length, pId) {
        const bottomP5jsCol = this.p5.get(pos[0], pos[1])
        const bottomCol = [this.p5.red(bottomP5jsCol), this.p5.green(bottomP5jsCol), this.p5.blue(bottomP5jsCol)]
        const multCol = mix[pId % mix.length](bottomCol, this.palette[color])

        for (let i = 1; i < length; i++) {

            const d = this.turbulence * this.p5.noise(
                this.frequency * pos[0],
                this.frequency * pos[1],
            )

            const n = planeCurve[this.func]({
                x: this.p5.map(pos[0], 0, this.p5.width, -7, 7),
                y: this.p5.map(pos[1], 0, this.p5.height, -7, 7)
            })
            const nD = Math.atan2(n.y, n.x) * d
            const size = 1 + (i/length) * 5

            this.dot(pos, size, multCol)
            pos[0] += Math.cos(nD) * size
            pos[1] += Math.sin(nD) * size
        }
		this.p5.updatePixels()
    }
}
