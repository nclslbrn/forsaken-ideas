import mix from './mix-color'
import planeCurve from '../../sketch-common/plane-curve'

const functionNames = Object.keys(planeCurve)

export default class Emitter {
    constructor(frequency, turbulence, palette, dot, p5) {
        this.frequency = frequency
        this.turbulence = turbulence
        this.palette = palette
        this.dot = dot
        this.p5 = p5
        this.func = p5.random(functionNames)
        this.sample = 2

        console.log(this.func)
    }

    spread(pos, color, length, pId) {
        const bottomP5jsCol = this.p5.get(pos[0], pos[1])
        const bottomCol = [
            this.p5.red(bottomP5jsCol),
            this.p5.green(bottomP5jsCol),
            this.p5.blue(bottomP5jsCol)
        ]
        const multCol = mix[pId % mix.length](bottomCol, this.palette[color])

        for (let i = 1; i < length; i++) {
            const d =
                this.turbulence *
                this.p5.noise(
                    this.frequency * pos[0] + i,
                    this.frequency * pos[1] + i
                )

            const n = planeCurve[this.func]({
                x: this.p5.map(
                    pos[0] * Math.cos(d),
                    0,
                    this.p5.width,
                    -this.sample,
                    this.sample
                ),
                y: this.p5.map(
                    pos[1] * Math.sin(d),
                    0,
                    this.p5.height,
                    -this.sample,
                    this.sample
                )
            })
            const nn = planeCurve['julia']({
                x: Math.sin(n.x),
                y: Math.sin(n.y)
            })
            const size = this.p5.map(d, 0, this.turbulence, 0.5, 5)
            this.dot(pos, size, multCol)
            pos[0] += (nn.x / this.sample) * size
            pos[1] += (nn.y / this.sample) * size
        }
        //this.p5.updatePixels()
    }
}
