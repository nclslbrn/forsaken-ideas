import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import SvgTracer from '../../sketch-common/svg-tracer'

const ROOT = document.getElementById('windowFrame'),
    LOADER = document.getElementById('loading'),
    MARGIN = 10,
    SVG = new SvgTracer({
        parentElem: ROOT,
        size: 'A3_landscape', //{ w: 45.5, h: 27 },
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
        `@import url('https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap');`,
        style.sheet.cssRules.length
    )
    style.sheet.insertRule(
        `text { font-family: Geist; font-weight: 700; }`,
        style.sheet.cssRules.length
    )
}

const sketch = {
    init: () => {
        const inner = [SVG.width - MARGIN * 2, SVG.height - MARGIN * 2],
            base = 10,
            svgDisplayWidth = SVG.elem.getBoundingClientRect().width,
            texts = 'singular/alterity/similar/alteration/system/protocole/structure'.split('/')

        let y = MARGIN,
            fontSize = base

        SVG.clear()
        addFontFile()

        while (y < inner[1]) {
            y += fontSize * 0.8
            let x = 0,
            txtIdx = 0

            while (x < SVG.width) {
                const text = `${texts[txtIdx]}+`

                SVG.text({
                    x: x,
                    y,
                    fontSize,
                    text,
                    fontFamily: 'Geist',
                    fontWeight: Math.round(100 + 300 * (1 - base / fontSize)),
                    fill: '#333',
                    anchor: 'middle'
                })

                const textWidth =
                    (SVG.elem.lastChild.getBoundingClientRect().width /
                        svgDisplayWidth) *
                    SVG.width

                x += textWidth * 0.96
                txtIdx++
                txtIdx = txtIdx % texts.length
            }
            fontSize *= 1.16
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
