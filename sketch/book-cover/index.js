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
    'iteration', 'alteration', 'recursion', 'collision', 'constraint', 'composition', 'protocol', 'system', 'grids', 'point',
    'organization', 'spacing', 'shearing', 'possible', 'squares', 'GRAV', 'transformation', 'balance', 'precision', 'radicalism',
    'condition', 'rhythm', 'tangible', 'infra-thin', 'sequences', 'language', 'deconstruction', 'abstraction', 'strata', 'manipulation', 
    'architectural', 'process', 'mechanism', 'accumulation'
]

const sketch = {
    init: () => {
        const inner = [SVG.width - MARGIN*2, SVG.height - MARGIN*2],
            base = 32;

        let y = MARGIN, 
            fontSize = base
        
        SVG.clear()
        let w = 0, l = 0;

        while (y + fontSize < inner[1]) {
            y += fontSize * 1.25
            let x  = MARGIN

            while (x < inner[0]) { 
                const text = texts[Math.floor(Math.random() * texts.length)] 
                SVG.text({x, y, fontSize, text, fontFamily: 'Inter'})
                x += text.length * fontSize * 0.64
                //x += fontSize * 10
                w++
            }
            if (w % 16 === 0) { 
                fontSize = base
            } else {
                fontSize += base
            }
            l++

            fontSize *= l % 4 === 0 ? 1.66 :  0.66 // (l%4) / 2.5
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