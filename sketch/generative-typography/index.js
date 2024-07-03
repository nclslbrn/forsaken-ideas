import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'

import p5 from 'p5'
import { autoBezierCurve } from '../../sketch-common/bezierCurve'
import { paperTexture } from '../../sketch-common/paperTexture'
import { getPalette } from '@nclslbrn/artistry-swatch'
import { shadeColor } from '../../sketch-common/shadeColor'
import ease from '../../sketch-common/ease'

const { ceil, floor, cos, sin, PI, random, round } = Math

const sketch = (p5) => {
    const letterSize = { x: 1400, y: 1200 }
    const margin = { x: letterSize.x * 0.1, y: letterSize.y * 0.2 }
    let dx = margin.x,
        dy = margin.y,
        colId = 0,
        signSize,
        palette,
        canvas

    const quadLerp = (p0, p1, p2, t) =>
        p5.lerp(p5.lerp(p0, p1, t), p5.lerp(p1, p2, t), t)

    const flattenBezier = (x1, y1, cpX, cpY, x2, y2, steps) => {
        const curve = []
        for (let k = 0; k <= steps; k++) {
            const t = k / steps,
                x = quadLerp(x1, cpX, x2, 1 - ease(t)),
                y = quadLerp(y1, cpY, y2, 1 - ease(t))

            curve.push({ x, y })
        }
        return curve
    }

    const letter = () => {
        const scale = p5.random(0.25, 0.55) + 0.35
        const randPoints = Array.from(Array(floor(p5.random(5, 9)))).map(() => {
            return {
                x:
                    dx +
                    signSize.x * 0.5 +
                    (random() - 0.5) * signSize.x * scale,
                y: dy + signSize.y * 0.5 + (random() - 0.5) * signSize.y * scale
            }
        })
        const bezier = autoBezierCurve(randPoints, 1 + 2 * random())

        for (let i = 0; i < bezier.length; i++) {
            // create a dash pattern [[x1, width1], [x2, width2]
            const brush = []
            const ang = random() > 0.5 ? PI/3 : PI*2/3
            let bx = 0
            while (bx < 40) {
                const w = round(p5.random(8, 12))
                brush.push([bx, bx+w])
                bx += round(p5.random(8, 16))
            }

            if (bezier[i].length > 2) {
                const flat = flattenBezier(
                    bezier[i][0].x,
                    bezier[i][0].y,
                    bezier[i][1].x,
                    bezier[i][1].y,
                    bezier[i][2].x,
                    bezier[i][2].y,
                    2 * Math.hypot(
                        bezier[i][2].x - bezier[i][1].x,
                        bezier[i][2].y - bezier[i][1].y
                    )
                )
                for (let j = 0; j < flat.length; j++) {
                    const alpha = (
                        '0' + round((1-(j / flat.length)) * 255).toString(16)
                    ).slice(-2)
                    //console.log(alpha)
                    p5.stroke(`${palette.colors[colId]}${alpha}`)

                    for (let h = 0; h < brush.length; h++) {
                        p5.line(
                            flat[j].x + cos(ang) * brush[h][0],
                            flat[j].y + sin(ang) * brush[h][0],
                            flat[j].x + cos(ang) * brush[h][1],
                            flat[j].y + sin(ang) * brush[h][1]
                        )
                   }
                }
            }
        }
    }

    p5.setup = () => {
        canvas = p5.createCanvas(letterSize.x, letterSize.y)
        canvas.elt.style.aspectRatio = `${letterSize.x} / ${letterSize.y}`
        p5.pixelDensity(window.devicePixelRatio || 1)
        p5.noLoop()
        p5.smooth(5)
    }

    p5.draw = () => {
        palette = getPalette() 
        p5.background(palette.background)
        paperTexture(
            canvas,
            p5.drawingContext,
            shadeColor(
                palette.background,
                palette.theme === 'bright' ? 10 : -20
            )
        )
        //p5.noStroke()
        p5.strokeWeight(ceil(p5.random(4, 8)))
        signSize = { x: 200, y: 320 }

        while (dy < letterSize.y - margin.y - signSize.y) {
            if (dx < letterSize.x - margin.x - signSize.x) {
                if (random() > 0.2) {
                    letter()
                    dx += signSize.x
                } else {
                    dx += signSize.x
                }
            } else {
                if (random() > 0.7) {
                    dy += signSize.y
                    colId++
                    if (colId === palette.colors.length) colId = 0
                }
                dy += signSize.y
                colId++
                if (colId === palette.colors.length) colId = 0
                dx = margin.x
            }
        }
    }
    sketch.initSketch = () => {
        colId = 0
        dx = margin.x
        dy = margin.y
        p5.redraw()
    }
    sketch.exportJPG = () => p5.save('Generative-typography')
}

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

new p5(sketch, windowFrame)
windowFrame.removeChild(loader)
window.init = sketch.initSketch
window.export_JPG = sketch.exportJPG
window.infobox = infobox
handleAction()
