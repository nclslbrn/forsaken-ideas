import mix from './mix-color'
import strangeAttractors from '../../sketch-common/strange-attractors'

const attractors = strangeAttractors().attractors
const attractorNames = Object.entries(attractors).map((attr_name) => attr_name[0])

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
        this.pickedAttr = p5.random(attractorNames)
        this.attractor = strangeAttractors().attractors[this.pickedAttr]
        strangeAttractors().init(this.pickedAttr)

    }

    spread(pos, color, length, pId) {
        const bottomP5jsCol = this.p5.get(pos[0], pos[1])
        const bottomCol = [this.p5.red(bottomP5jsCol), this.p5.green(bottomP5jsCol), this.p5.blue(bottomP5jsCol)]
        const multCol = mix[pId % mix.length](bottomCol, this.palette[color])
        strangeAttractors().init(this.pickedAttr)


        for (let i = 1; i < length; i++) {
        
            const d = this.turbulence * this.p5.noise(
                this.frequency * pos[0],
                this.frequency * pos[1],
            )

            const n = this.attractor({
                x: Math.cos(d) + pos[0],
                y: Math.sin(d) + pos[1]
            })
            //console.log(n)
            const nD = Math.atan2(n.y, n.x)
            const size = 1 + (i/length) * 5

            this.dot(pos, size, multCol)
            pos[0] += Math.cos(nD) * size/2
            pos[1] += Math.sin(nD) * size/2
        }
		this.p5.updatePixels()
    }
}
