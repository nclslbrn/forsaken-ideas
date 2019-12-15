import * as SVG from "svg.js"

const computeSVG = (
    lines,
    strokeColor,
    strokeOpacity,
    svgContainerId,
    width,
    height,
    strokeWidth
) => {
    const svgContainer = document.createElement("div")
    svgContainer.id = svgContainerId
    svgContainer.setAttribute(
        "style",
        "display: none; width: " + width + "px; height: " + height + "px;"
    )
    if (document.getElementById(svgContainerId) == null) {
        document.body.appendChild(svgContainer)
    } else {
        document.getElementById(svgContainerId).innerHTML = ""
    }

    const draw = SVG(svgContainerId).size(width + "px", height + "px")
    let group = draw.group()
    group.attr({
        fill: 0,
        "fill-opacity": 0,
        stroke: strokeColor,
        "stroke-opacity": strokeOpacity
    })

    for (let l = 0; l < lines.length; l++) {
        const invPercent = 1 - l / lines.length
        const lineWidth =
            strokeWidth.min + invPercent * (strokeWidth.max - strokeWidth.min)

        const line = draw.line(
            lines[l].x1,
            lines[l].y1,
            lines[l].x2,
            lines[l].y2
        )
        line.stroke({ color: strokeColor, width: lineWidth, linecap: "round" })
    }
}

export default computeSVG
