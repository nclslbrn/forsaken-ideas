import * as SVG from 'svg.js'

const computeSVG = (roads, builds, palette, bgColor, svgContainerId) => {

    const svgContainer = document.createElement('div')
    svgContainer.id = svgContainerId
    svgContainer.setAttribute(
        'style',
        'display: none; width: ' + window.innerWidth + 'px; height: ' + window.innerHeight + 'px;'
    )
    if (document.getElementById(svgContainerId) == null) {
        document.body.appendChild(svgContainer)
    } else {
        document.getElementById(svgContainerId).innerHTML = '';
    }

    const draw = SVG(svgContainerId).size(window.innerWidth + 'px', window.innerHeight + 'px')

    /*  hide the canvas
    if (document.getElementsByClassName('p5Canvas')[0]) {
        document.getElementsByClassName('p5Canvas')[0].style.display = 'none';
    }*/
    let background = draw.rect(window.innerWidth, window.innerHeight)
    background.x(0)
    background.y(0)
    background.fill({
        color: 'rgb(' + bgColor.levels[0] + ',' + bgColor.levels[1] + ',' + bgColor.levels[2] + ')'
    })

    for (let rect = 0; rect < roads.length; rect++) {
        let points = []
        for (let point = 0; point < roads[rect].length; point++) {
            points.push([roads[rect][point].x, roads[rect][point].y])
        }

        let polyline = draw.polyline(points)
        polyline.fill(palette.background)
    }
    for (let color_id = 0; color_id < builds.length; color_id++) {

        for (let rect = 0; rect < builds[color_id].length; rect++) {

            let points = []

            for (let point = 0; point < builds[color_id][rect].length; point++) {
                points.push([builds[color_id][rect][point].x, builds[color_id][rect][point].y])
            }

            let polyline = draw.polyline(points)
            polyline.fill(palette.colors[color_id])

        }
    }
}
export default computeSVG