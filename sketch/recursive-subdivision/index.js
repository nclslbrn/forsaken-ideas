'use strict'
import '../../src/sass/project.scss'
import '../../src/sass/frame-canvas.scss'
import recursiveSubdivision from './recurive-subdivision'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

recursiveSubdivision.launch()
containerElement.removeChild(loader)
window.init = recursiveSubdivision.init
window.export = recursiveSubdivision.export
window.infobox = infobox
handleAction()
