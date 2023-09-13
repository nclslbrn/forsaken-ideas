
import '../framed-canvas.css'
// Uncomment to export anim into GIF
// Add "p5.createloop" into property.json libs
// import 'p5.createLoop'
import p5 from 'p5'
import zoneOccupancy from './zone-occupancy'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')
new p5(zoneOccupancy, windowFrame)
windowFrame.removeChild(loader)
window.init = zoneOccupancy.init
window.download_JPG = zoneOccupancy.download_JPG
window.infobox = infobox
handleAction()
