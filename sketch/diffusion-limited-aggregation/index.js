'use strict'
import style from '../../src/sass/project.scss'
import fullCanvas from '../../src/sass/frame-canvas.scss'
import sketch from './diffusion-limited-aggregation'
import computeSVG from './computeSVG'
import exportSVG from '../../src/js/sketch-common/exportSVG'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const containerElement = document.body
const loader = document.getElementById('loading')

const P5 = new p5(sketch, containerElement)
document.body.removeChild(loader)

let resizeTimeout
window.addEventListener('resize', function (event) {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(function () {
        containerElement.removeChild(
            containerElement.getElementsByClassName('p5Canvas')[0]
        )
        let P5 = new p5(sketch, containerElement)
    }, 500)
})

const downloadSVG = () => {
    if (
        window.confirm(
            'Would you like to download the actual sketch as SVG file ?'
        )
    ) {
        const svgContainerId = 'svg-clipboard'
        const {
            lines,
            width,
            height,
            strokeWidth
        } = sketch.getSketchProperties()
        const date = new Date()
        const filename =
            'Diffusion-limited-aggregation.' +
            date.getFullYear() +
            '-' +
            date.getMonth() +
            '-' +
            date.getDay() +
            '_' +
            date.getHours() +
            '.' +
            date.getMinutes() +
            '.' +
            date.getSeconds() +
            '--Nicolas_Lebrun.svg'

        computeSVG(lines, '#000', 1, svgContainerId, width, height, strokeWidth)
        exportSVG(svgContainerId, filename)
    }
}

window.download_SVG = downloadSVG
window.init = sketch.init
window.infobox = infobox
handleAction()
