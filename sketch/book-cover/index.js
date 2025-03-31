import '../framed-canvas.css'
import { getPalette } from '@nclslbrn/artistry-swatch'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import SvgTracer from '../../sketch-common/svg-tracer'

const ROOT = document.getElementById('windowFrame'),
    LOADER = document.getElementById('loading'),
    MARGIN = 50,
    SVG = new SvgTracer({
        parentElem: ROOT,
        size: 'A4_portrait',
        background: '#fff',
        dpi: 300
    })

const addFontFile = () => {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
    style.innerText = `
    @font-face: "Inter";
    src: url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");
    `
    defs.appendChild(style)
    SVG.elem.appendChild(defs)
}
const texts = [
    ['frame', 'drame', 'name', 'same', 'game', 'roam', 'scam', 'spam', 'swam'],
    ['iteration', 'alteration', 'recursion', 'collision', 'dilution', 'distortion', 'erosion', 'generation', 'inception'],
    ['surface', 'depth', 'randomness', 'trace', 'interlace', 'space'],
    ['none', 'false', 'null', 'xxx', '++++++', '-------', '/////']
]

const sketch = {
    init: () => {
        const inner = [SVG.width - MARGIN*2, SVG.height - MARGIN*2]
        let y = MARGIN, 
            fontSize = 58, 
            columns = 3,
            colWidth = inner[0]/columns,
            midY = (MARGIN + inner[1]) / 2
        
        SVG.clear()

        while (y + fontSize < inner[1]) {
            y += fontSize * 1.5
            for (let c = 0; c < columns; c++) {
                const x = MARGIN + c * colWidth
                SVG.text({
                    x, 
                    y, 
                    fontSize, 
                    text: texts[c][Math.floor(Math.random() * texts[c].length)], 
                    fontFamily: 'Inter'
                })
            }
            if (y < midY) {
                fontSize += 8
            } else {
                fontSize -= 8
            }
        }
    }    
}

ROOT.removeChild(LOADER)
SVG.init()
addFontFile()
sketch.init()
window['init'] = () => sketch.init()
window['download'] = () => SVG.export({
    name: `output-${new Date().toISOString()}`
})
handleAction()