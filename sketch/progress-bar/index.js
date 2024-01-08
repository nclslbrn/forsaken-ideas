import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import p5 from 'p5'
import { createNoise2D } from 'simplex-noise'
import { getPalette } from '@nclslbrn/artistry-swatch'
import { shadeColor } from '../../sketch-common/shadeColor'
import { paperTexture } from '../../sketch-common/paperTexture'
import Notification from '../../sketch-common/Notification'

const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')
const params = new URLSearchParams(window.location.search)
const { sin, cos, PI, min, round } = Math
const res = 0.03
const s = params.has('dim')
    ? params
          .get('dim')
          .split('x')
          .map((v) => parseInt(v))
    : [960, 1200]

const prgssbr = (p5) => {
    let maxRadius, c, a, palette, canvas, step, noise

    p5.setup = () => {
        canvas = p5.createCanvas(...s)
        canvas.elt.style.aspectRatio = `${s[0]} / ${s[1]}`
        maxRadius = min(...s) * 0.5
        c = s.map((d) => d / 2)
        prgssbr.init()
    }
    prgssbr.init = () => {
        noise = createNoise2D()
        palette = getPalette()
        a = round(p5.random(3, 5))
        step = round(maxRadius / a)
        p5.background(palette.background)
        paperTexture(
            canvas.elt,
            p5.drawingContext,
            shadeColor(
                palette.background,
                5 * (palette.theme === 'bright' ? -1 : 1)
            )
        )

        p5.noLoop()
        p5.noFill()

        for (let i = 0; i < a; i++) {
            const r = step * (i + 1)
            const iba = 0.5 + (0.5 * (i + 1)) / a
            //p5.stroke(palette.stroke)
            for (let l = 0; l < PI * 2; l += res) {
                const n = 0.25 + 0.75 * noise(cos(l) * iba, sin(l) * iba)
                let p = [c[0] + r * n * Math.cos(l), c[1] + r * n * Math.sin(l)]

                p5.stroke(`${palette.colors[i % palette.colors.length]}44`)
                p5.beginShape()

                for (let m = 0; m < n * r * 12; m++) {
                    p5.vertex(...p)
                    const pn = noise(cos(p[0]) * r, sin(p[1]) * r) * 150
                    p[0] += Math.cos(pn) * 2
                    p[1] += Math.sin(pn) * 2
                }

                p5.endShape()
            }
        }
        new Notification(
            `Palette from <em>${palette.meta.title}</em> by ${palette.meta.artist}.`,
            containerElement,
            'light'
        )
    }

    prgssbr.capture = () => {
        const d = new Date()
        p5.save(canvas, `Progress-bar.${d.toISOString()}`, 'jpg')
    }
}

new p5(prgssbr, containerElement)
containerElement.removeChild(loader)
window.infobox = infobox
window.init = prgssbr.init
window.capture = prgssbr.capture
handleAction()
