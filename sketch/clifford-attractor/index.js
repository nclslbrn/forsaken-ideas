'use strict'
import style from '../../src/sass/project.scss'
import fullCanvas from '../../src/sass/frame-canvas.scss'
import sketch from './clifford-attractor'
import computeSVG from './computeSVG'
import exportSVG from '../../tools/exportSVG'
import infobox from '../../src/js/infobox'
import handleAction from '../../src/js/handle-action'

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
        const { points, width, height } = sketch.getSketchProperties()
        const date = new Date()
        const filename =
            'Clifford-Attractor.' +
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

        computeSVG(points, '#000', 0.1, svgContainerId, width, height)
        exportSVG(svgContainerId, filename)
    }
}

window.download_SVG = downloadSVG
window.init = sketch.init
window.infobox = infobox
handleAction()
