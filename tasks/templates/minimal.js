import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

/**
 * Generative code goes here
 * Add the rendered element (HTML) to containerElement
 */

containerElement.removeChild(loader)
/**
 * Using sidebar action 
 *
window.init = sketch.init
window.capture = sketch.capture
*/
window.infobox = infobox
handleAction()
