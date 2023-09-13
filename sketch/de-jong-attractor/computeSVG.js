import * as SVG from "svg.js"

const computeSVG = (
    points,
    strokeColor,
    strokeOpacity,
    svgContainerId,
    width,
    height
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
        "stroke-opacity": strokeOpacity,
        "stroke-width": 0.5
    })

    for (let curve = 0; curve < points.length; curve++) {
        if (points[curve].length > 0) {
            let pathArray = []
            pathArray.push(["M", points[curve][0].x, points[curve][0].y])

            for (let pos = 1; pos < points[curve].length; pos++) {
                pathArray.push([
                    "L",
                    points[curve][pos].x,
                    points[curve][pos].y
                ])
            }
            //don't close path pathArray.push(['Z'])

            group.path(new SVG.PathArray(pathArray))
        }
    }
}
export default computeSVG
