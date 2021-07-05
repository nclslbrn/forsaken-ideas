'use strict'
import '../../src/sass/project.scss'
import '../../src/sass/full-canvas.scss'
import './mondrian-city.scss'
import p5 from 'p5'
import p5Collide2D from 'p5.collide2d'
import sketch from './mondrian-city'
import computeSVG from './computeSVG'
import exportSVG from '../../src/js/sketch-common/exportSVG'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

new p5(sketch, containerElement)
containerElement.removeChild(loader)

var resizeTimeout
window.addEventListener('resize', function (event) {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(function () {
        containerElement.removeChild(
            containerElement.getElementsByClassName('p5Canvas')[0]
        )
        new p5(sketch, containerElement)
    }, 500)
})

const downloadSVG = () => {
    if (
        window.confirm(
            'Would you like to download the actual sketch as SVG file ?'
        )
    ) {
        const svgContainerId = 'svg-clipboard'
        const { roads, builds, palette, paperColor } = sketch.getCityData()
        const date = new Date()
        const filename =
            'Mondrian-City.' +
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
            '--copyright_Nicolas_Lebrun_CC-by-3.0.svg'

        computeSVG(roads, builds, palette, paperColor, svgContainerId)
        exportSVG(svgContainerId, filename)
    }
}

window.download_SVG = downloadSVG
window.init = sketch.init
window.exportJPG = sketch.exportJPG
window.infobox = infobox
handleAction()
