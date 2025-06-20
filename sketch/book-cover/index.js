import '../framed-canvas.css'
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
    const style = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'style'
    )
    defs.appendChild(style)
    style.type = 'text/css'
    style.sheet.insertRule(
        `@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');`,
        style.sheet.cssRules.length
    )
    style.sheet.insertRule(
        `text { font-family: Inter; font-weight: 900; }`,
        style.sheet.cssRules.length
    )
}

const sketch = {
    init: () => {
        const inner = [SVG.width - MARGIN * 2, SVG.height - MARGIN * 2],
            base = 10,
            svgDisplayWidth = SVG.elem.getBoundingClientRect().width,
            text = 'SOL',
            rcs = 0.33

        let y = MARGIN,
            fontSize = base

        SVG.clear()
        addFontFile()
        SVG.rect({
            x: 0,
            y: 0,
            w: SVG.width,
            h: SVG.height,
            fill: '#333'
        })
        let w = 0,
            l = 0

        while (y + fontSize < inner[1]) {
            y += fontSize
            let x = 0 //fontSize * text.length * 0.25

            while (x < SVG.width) {
                SVG.text({
                    x: SVG.width / 2 - (x + fontSize * text.length * rcs),
                    y,
                    fontSize,
                    text,
                    fontFamily: 'Inter Variable',
                    fontWeight: Math.round(400 + 300 * (1 - base / fontSize)),
                    fill: '#ccc',
                    anchor: 'middle'
                })
                SVG.text({
                    x: SVG.width / 2 + (x - fontSize * text.length * rcs),
                    y,
                    fontSize,
                    text,
                    fontFamily: 'Inter Variable',
                    fontWeight: Math.round(400 + 300 * (1 - base / fontSize)),
                    fill: '#ccc',
                    anchor: 'middle'
                })
                w++
                const textWidth =
                    (SVG.elem.lastChild.getBoundingClientRect().width /
                        svgDisplayWidth) *
                    SVG.width
                x += textWidth + fontSize * 0.5
            }
            fontSize *= 1.16
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
window['download'] = () =>
    SVG.export({ name: `cover-${new Date().toISOString()}` })
window['capture'] = () =>
    SVG.exportPng({ name: `cover-${new Date().toISOString()}`, quality: 1 })
window['infobox'] = infobox
handleAction()
