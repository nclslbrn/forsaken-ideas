'use strict'
import '../../src/sass/project.scss'
import '../../src/sass/frame-canvas.scss'
import sketch from './de-jong-attractor'
// import exportSVG from '../../src/js/sketch-common/exportSVG'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

//new p5(sketch, windowFrame)
sketch.setup()
windowFrame.removeChild(loader)

/* let resizeTimeout
window.addEventListener('resize', function (event) {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(function () {
        windowFrame.removeChild(
            windowFrame.getElementsByClassName('p5Canvas')[0]
        )
        let P5 = new p5(sketch, windowFrame)
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
            'De-Jong-Attractor.' +
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
window.download_SVG = downloadSVG */
window.init = sketch.init
window.download_SVG = sketch.export
window.infobox = infobox
handleAction()
