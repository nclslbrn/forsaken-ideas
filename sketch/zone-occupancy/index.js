'use strict'
import '../../src/sass/project.scss'
import '../../src/sass/frame-canvas.scss'
// Uncomment to export anim into GIF
// Add "p5.createloop" into property.json libs
// import 'p5.createLoop'
import zoneOccupancy from './zone-occupancy'
import infobox from '../../src/js/sketch-common/infobox'
import handleAction from '../../src/js/sketch-common/handle-action'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')
const P5 = new p5(zoneOccupancy, windowFrame)
windowFrame.removeChild(loader)
window.infobox = infobox
handleAction()
