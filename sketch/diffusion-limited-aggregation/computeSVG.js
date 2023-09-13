
import SvgTracer from '../../sketch-common/svg-tracer'

const computeSVG = (lines, strokeColor, svgContainer, width, height, strokeWidth) => {
    const tracer = new SvgTracer({
        parentElem: svgContainer,
        size: { w: width, h: height },
        dpi: 72
    })
    tracer.init()
    for (let l = 0; l < lines.length; l++) {
        const invPercent = 1 - l / lines.length
        const lineWidth = strokeWidth.min + invPercent * (strokeWidth.max - strokeWidth.min)

        tracer.path({
            points: [[
                tracer.cmToPixels(lines[l].x1), tracer.cmToPixels(lines[l].y1)
            ], [
                tracer.cmToPixels(lines[l].x2), tracer.cmToPixels(lines[l].y2)
            ]],
            fill: 'none',
            stroke: strokeColor,
            strokeWidth: tracer.cmToPixels(lineWidth),
            close: false
        })
    }
    tracer.export({ name: 'Diffusion-limited-aggregation' })
}
export default computeSVG
