import '../framed-canvas.css'
import { getPalette } from '@nclslbrn/artistry-swatch'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import SvgTracer from '../../sketch-common/svg-tracer'

const ROOT = document.getElementById('windowFrame'),
    LOADER = document.getElementById('loading'),
    MARGIN = 200,
    SVG = new SvgTracer({
        parentElem: ROOT,
        size: 'A3_portrait',
        background: '#fff',
        dpi: 300
    })

const addFontFile = () => {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    SVG.elem.appendChild(defs)
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
    defs.appendChild(style)
    style.type = 'text/css';
    style.sheet.insertRule(`@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');`, style.sheet.cssRules.length);
    style.sheet.insertRule(`text { font-weight: 900; }`, style.sheet.cssRules.length)

}
const texts = [
    'iteration', 'alteration', 'recursion', 'collision', 'constraint', 'composition', 'protocol', 'system', 'grids', 'point',
    'organization', 'spacing', 'shearing', 'possible', 'squares', 'transformation', 'balance', 'precision', 'radicalism',
    'condition', 'rhythm', 'tangible', 'infra-thin', 'sequences', 'language', 'deconstruction', 'abstraction', 'strata', 'manipulation', 
    'architectural', 'process', 'mechanism', 'accumulation', 'repetition', 'intricate', 'opposing', 'combining', 'singularity', 'self-reflective',
    'successive', 'section', 'shape', 'phenomenon', 'replacing', 'arbitrary', 'synthetic', 'superimposing', 'groups', 'distances', 
    'hatchings', 'instructions', 'algorithms', 'coherent', 'polygon', 'parallel', 'stacked', 'subdivided', 'experiments', 'decompose', 'rules',
    'straight', 'perpendicular', 'perspective', 'geometry', 
    
    'while', 'whatever', 'no more', 'if',
    '+', '|', '_____', '-------->', '<----', ">>>", '^^^', '?', '******', '** ***', '[error]', '&'
]

const sketch = {
    init: () => {
        const inner = [SVG.width - MARGIN*2, SVG.height - MARGIN*2],
            base = 64,
            svgDisplayWidth = SVG.elem.getBoundingClientRect().width,
            palette = getPalette();

        let y = MARGIN, 
            fontSize = base
        
        SVG.clear()
        SVG.rect({ 
            x: 0,
            y: 0,
            w: SVG.width,
            h: SVG.height, 
            fill: palette.background
        })
        let w = 0, l = 0;

        while (y + fontSize * 3  < inner[1]) {
            y += fontSize * (fontSize === base ? 3 : 1.25)
            let x  = MARGIN

            while (x < inner[0] - MARGIN * 3) { 
                const text = texts[Math.floor(Math.random() * texts.length)]
                if (x + text.length * fontSize * 0.5 < inner[0]) { 
                    SVG.text({
                        x, 
                        y, 
                        fontSize, 
                        text, 
                        fontFamily: "Inter Variable",
                        fill: l % 12 === 0 && l > 0 
                            ? palette.colors[Math.floor(Math.random() * palette.colors.length)]
                            : palette.colors[0],
                        anchor: 'middle'
                    })
                }
                const textWidth = (SVG.elem.lastChild.getBoundingClientRect().width/svgDisplayWidth) * SVG.width 
                x += textWidth + fontSize * .5
                w++
            }
            fontSize *= l % 7 === 0 ? 1.33 :  0.66
            
            if (l % 9 === 0) { 
                fontSize = base
            } else {
                fontSize *= 1.66
            }
            l++

        }
    }    
}

ROOT.removeChild(LOADER)
SVG.init()
SVG.elem.style.padding = '0'
// SVG.elem.style.maxWidth = '100%'
// SVG.elem.style.maxHeight = '100%'
addFontFile()
sketch.init()
window['init'] = () => sketch.init()
window['download'] = () => SVG.export({ name: `cover-${new Date().toISOString()}`})
window['capture'] = () => SVG.exportPng({ name: `cover-${new Date().toISOString()}`, quality: 1})
window['infobox'] = infobox
handleAction()