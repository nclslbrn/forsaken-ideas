import SvgTracer from './svg-tracer'

/**
 * Simple function to save inline (html) Svg into .SVG file
 * @param {string|object} svgContainer the svg parent element id or node element
 * @param {string} sketchName used to prefix the name of the SVG
 */
const exportSVG = (svgContainer, sketchName) => {
    let svgFile = null
    let parent = null
    const date = new Date(),
        Y = date.getFullYear(),
        m = date.getMonth(),
        d = date.getDay(),
        H = date.getHours(),
        i = date.getMinutes()

    const filename = `${sketchName}.${Y}-${m}-${d}_${H}.${i}.svg`
    if (
        svgContainer instanceof Element ||
        svgContainer instanceof HTMLDocument
    ) {
        parent = svgContainer
    } else {
        parent = document.getElementById(svgContainer)
    }

    var data = new Blob([parent.innerHTML], {
        type: 'text/plain'
    })
    if (svgFile !== null) {
        window.URL.revokeObjectURL(svgFile)
    }
    svgFile = window.URL.createObjectURL(data)

    const link = document.createElement('a')
    link.href = svgFile
    link.download = filename
    link.click()
}

export default exportSVG
