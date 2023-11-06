import { SYSTEM } from '@thi.ng/random'
import { noiseLine } from './noiseLine'
import { randomSection } from './randomSection'

const { floor, round } = Math
const resolveState = (config) => {
    const dpr = window.devicePixelRatio || 1
    const width = config.width * dpr
    const height = config.height * dpr
    const step = round(SYSTEM.minmax(0.07, 0.12) * height)
    const ground = round(step / SYSTEM.minmax(8, 16))
    const scale = SYSTEM.minmax(0.03, 0.07)
    const initMargin = (config.mode === 'plotter' ? 200 : 100) * dpr
    const numBands = floor((height - initMargin * 2) / step)
    const margin = [
        initMargin,
        initMargin + floor((height - initMargin * 2) % (numBands * step)) / 2
    ]
    const variationLabel = [
        'Varying noise & fixed section',
        'Fixed noise & varying section'
    ]
    const variation = SYSTEM.float() > 0.5 ? 0 : 1
    const varyingLinespacing = SYSTEM.float() > 0.5 ? 0 : 1
    const tickPadding = SYSTEM.minmaxInt(1, 16) * dpr
    return {
        width,
        height,
        dpr,
        step,
        ground,
        scale,
        margin,
        numBands,
        mode: config.mode,
        variation: { id: variation, label: variationLabel[variation] },
        bands: noiseLine(
            step,
            scale,
            ground,
            margin,
            width,
            height,
            variation,
            dpr
        ),
        sections: randomSection(
            width,
            variation === 1 ? numBands : 1,
            varyingLinespacing,
            dpr
        ),
        varyingLinespacing,
        tickPadding
    }
}
export { resolveState }
