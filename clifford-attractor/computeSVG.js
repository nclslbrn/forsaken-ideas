import * as SVG from 'svg.js'

const computeSVG = (points, color, svgContainerId, width, height) => {

    const svgContainer = document.createElement('div')
    svgContainer.id = svgContainerId
    svgContainer.setAttribute(
        'style',
        'display: block; width: ' + width + 'px; height: ' + height + 'px;'
    )
    if (document.getElementById(svgContainerId) == null) {
        document.body.appendChild(svgContainer)
    } else {
        document.getElementById(svgContainerId).innerHTML = '';
    }

    const draw = SVG(svgContainerId).size(width + 'px', height + 'px')

    /* debug  hide the canvas */
    if (document.getElementsByClassName('p5Canvas')[0]) {
        document.getElementsByClassName('p5Canvas')[0].style.display = 'none';
    }

    for (let curve = 0; curve < points.length; curve++) {

        if (points[curve].length > 0) {

            let pathArray = []
            pathArray.push(['M', points[curve][0].x, points[curve][0].y])

            for (let pos = 1; pos < points[curve].length; pos++) {
                pathArray.push(['L', points[curve][pos].x, points[curve][pos].y])
            }
            pathArray.push(['Z'])

            let path = draw.path(new SVG.PathArray(pathArray))
            path.stroke(color)
            path.fill('rgba(0, 0, 0, 0)')
        }
    }

}
export default computeSVG