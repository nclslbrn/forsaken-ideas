'use strict'
import '../../src/sass/project.scss'
import '../../src/sass/full-canvas.scss'
import threeTemplate from './three-template'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

threeTemplate.launch()
windowFrame.removeChild(loader)
window.infobox = infobox
handleAction()
