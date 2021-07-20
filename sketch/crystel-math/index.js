'use strict'
import '../../src/sass/project.scss'
import '../../src/sass/full-canvas.scss'
import s from './sketch'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

s.launch()
windowFrame.removeChild(loader)
window.infobox = infobox
window.init = s.init
handleAction()
