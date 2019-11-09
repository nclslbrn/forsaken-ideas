import * as SVG from 'svg.js'

const computeSVG = (points, color, svgContainerId) => {

    const svgContainer = document.createElement('div')
    svgContainer.id = svgContainerId
    svgContainer.setAttribute(
        'style',
        'display: block; width: ' + window.innerWidth + 'px; height: ' + window.innerHeight + 'px;'
    )
    if (document.getElementById(svgContainerId) == null) {
        document.body.appendChild(svgContainer)
    } else {
        document.getElementById(svgContainerId).innerHTML = '';
    }

    const draw = SVG(svgContainerId).size(window.innerWidth + 'px', window.innerHeight + 'px')

    /* debug  hide the canvas */
    if (document.getElementsByClassName('p5Canvas')[0]) {
        document.getElementsByClassName('p5Canvas')[0].style.display = 'none';
    }

    for (let curve = 0; curve < points.length; curve++) {
        if (points[curve].length > 0) {

            let curvePoints = points[curve].map(p => p.x + ' ' + p.y).flat()
            console.log(curvePoints)

        }

        /*
                let curvePoints = ''
                console.log(points[curve])
                for (let p = 0; p < points[curve].length; p++) {
                    curvePoints += points[curve][p].x + ' ' + points[curve][p].y + ' '
                }
                const curve = draw.path(curvePoints)
                curve.stroke(color)
        */
    }

}
export default computeSVG