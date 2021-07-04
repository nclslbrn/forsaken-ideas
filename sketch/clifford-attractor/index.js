'use strict'
import style from '../../src/sass/project.scss'
import fullCanvas from '../../src/sass/frame-canvas.scss'
import sketch from './clifford-attractor'
import computeSVG from './computeSVG'
import exportSVG from '../../src/js/sketch-common/exportSVG'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

new p5(sketch, windowFrame)
windowFrame.removeChild(loader)

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
window.downloadJPG = sketch.downloadJPG
window.download_SVG = downloadSVG
window.init = sketch.init
window.infobox = infobox
handleAction()
