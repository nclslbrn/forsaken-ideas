'use strict'
import '../../src/sass/project.scss'
import '../../src/sass/full-canvas.scss'
import app from './app'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

app.init()
windowFrame.removeChild(loader)
window.infobox = infobox
handleAction()
