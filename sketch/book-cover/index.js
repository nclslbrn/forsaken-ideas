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
        size: 'A4_portrait', //{ w: 45.5, h: 27 },
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
const sentences = [
    'A protocol creating arbitrary composition with randomnes using a small range of geometric elements.',
    'The program use recursion as if it were a self-reactive process.',
    'As an artist, I create a protocol to generate a composition but because of randomness, I also become a spectator when my program runs again, there is something unexpected.',
    'Coder artists work in this back and fourth, by changing the process and watching what it can produce.',
    'You have to leave enough choice to randomness, enough entropy, so that you can imagine what the process will produce, but without being completely sure.',
    'We may be seduced by a particular edition of a generative series, but we\'ll have a better understanding of the protocol when we look at all the editions produced.',
    'It was an opportunity to introduce new rules into the protocol.',
    'Each project is conceived as a system, with an initial state and a process that modifies this state to stop and freeze the composition.',
    'While the result of this protocol may evoke architectural, modern, or futuristic forms, it is fundamentally a process of deconstruction and accumulation-driven by an absurd mechanism.',

/*
    'iteration', 'alteration', 'recursion', 'collision', 'constraint', 'composition', 'protocol', 'system', 'grids', 'point',
    'organization', 'spacing', 'shearing', 'possible', 'squares', 'transformation', 'balance', 'precision', 'radicalism',
    'condition', 'rhythm', 'tangible', 'infra-thin', 'sequences', 'language', 'deconstruction', 'abstraction', 'strata', 'manipulation', 
    'architectural', 'process', 'mechanism', 'accumulation', 'repetition', 'intricate', 'opposing', 'combining', 'singularity', 'self-reflective',
    'successive', 'section', 'shape', 'phenomenon', 'replacing', 'arbitrary', 'synthetic', 'superimposing', 'groups', 'distances', 
    'hatchings', 'instructions', 'algorithms', 'coherent', 'polygon', 'parallel', 'stacked', 'subdivided', 'experiments', 'decompose', 'rules',
    'straight', 'perpendicular', 'perspective', 'geometry', 'entropy', 
    
    'while', 'whatever', 'no more', 'if', 'from', 'for', 'then', 'against', 
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    '+', '|', '_____', '-------->', '<----', ">>>", '^^^', '******', '** ***', '[error]', '&'
*/
]


const sketch = {
    init: () => {
        const inner = [SVG.width - MARGIN*2, SVG.height - MARGIN*2],
            base = 64,
            svgDisplayWidth = SVG.elem.getBoundingClientRect().width,
            texts = [...sentences[Math.floor(Math.random() * sentences.length)].split(' ')],
            palette = getPalette();

        let y = MARGIN, 
            fontSize = base * 1.33 * Math.ceil(Math.random() * 3)
        
        SVG.clear()
        SVG.rect({ 
            x: 0,
            y: 0,
            w: SVG.width,
            h: SVG.height, 
            fill: palette.background
        })
        let w = 0, l = 0;

        while (y + fontSize  < inner[1]) {
            y += fontSize * (fontSize === base ? 3 : 1.25)
            let x  = MARGIN

            while (
                x < inner[0] - MARGIN * 3 // check if enough place 
                || (x > inner[0] && texts.length - (w % texts.length) < 1) // or if the sentence will end soon
            ) { 
                const text = texts[w % texts.length]
                if (
                    x + text.length * fontSize * 0.5 < inner[0] // check for x overflow
                ) { 
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
                    w++
                }
                const textWidth = (SVG.elem.lastChild.getBoundingClientRect().width/svgDisplayWidth) * SVG.width 
                x += textWidth + fontSize * .5
            }
            fontSize *= l % 4 === 0 ? 1.16 :  0.66
            
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