import { SYSTEM, pickRandom } from '@thi.ng/random'
import { repeatedly } from '@thi.ng/transducers'
/**
 * Define segment
 * { length, type : line, solid, splitted solid }
 */
const types = ['lines', 'solid', 'splitted-solid']
const randomSection = (width, numSection, varyingLinespacing, dpr) => {
    const distribution = [
        ...repeatedly(() => {
            let remaining = dpr
            const widths = []
            while (remaining > 0) {
                const lenght = SYSTEM.minmax(0.01, 0.05) * dpr
                widths.push(lenght)
                remaining -= lenght
            }
            const sum = widths.reduce((sum, len) => (sum += len), 0)
            const sections = widths.map((len) => ({
                len: Math.round((len / sum) * width),
                type: pickRandom(types, SYSTEM),
                lineSpacing:
                    dpr * varyingLinespacing ? SYSTEM.minmaxInt(4, 8) : 4
            }))
            return sections
        }, numSection)
    ]
    return distribution
}

export { randomSection }
