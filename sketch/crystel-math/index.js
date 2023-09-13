import '../full-canvas.css'
import s from './sketch'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

s.launch(windowFrame)
windowFrame.removeChild(loader)
window.infobox = infobox
window.init = s.init
handleAction()
