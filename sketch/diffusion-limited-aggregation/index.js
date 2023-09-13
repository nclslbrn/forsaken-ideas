import '../framed-canvas.css'
import sketch from './diffusion-limited-aggregation'
import computeSVG from './computeSVG'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import p5 from 'p5'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

new p5(sketch, windowFrame)
windowFrame.removeChild(loader)

const downloadSVG = () => {
    if (window.confirm('Would you like to download a SVG file ?')) {

        const { lines, width, height, strokeWidth } = sketch.getSketchProperties()
        computeSVG(lines, 'black', windowFrame, width, height, strokeWidth)
    }
}

window.download_SVG = downloadSVG
window.downloadJPG = sketch.downloadJPG
window.init = sketch.init
window.infobox = infobox
handleAction()
