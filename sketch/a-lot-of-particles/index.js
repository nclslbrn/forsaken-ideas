import p5 from 'p5'
import '../framed-canvas.css'
import { getPalette } from '@nclslbrn/artistry-swatch'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import strangeAttractors from '../../sketch-common/strange-attractors'
import { shadeColor } from '../../sketch-common/shadeColor'
import { constant } from './constant'
// import Notification from '../../sketch-common/Notification'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')
const attractors = strangeAttractors().attractors

let canvas, prtcl, palette, attr, f

const alop = (p5) => {
    alop.init = function () {
        prtcl = []
        palette = getPalette({ theme: 'bright' })

        window.attractors = p5.random(constant)
        attr = attractors['clifford']

        for (let x = -3.5; x < 3.5; x += 0.1) {
            for (let y = -3.5; y < 3.5; y += 0.1) {
                prtcl.push([
                    x + p5.random(-0.02, 0.02),
                    y + p5.random(-0.02, 0.02),
                    Math.round(p5.random(2, 6))
                ])
            }
        }
        p5.background(palette.background)
        p5.noStroke()
        p5.loop()
        f = 1
    }

    alop.download_JPG = function () {
        const date = new Date()
        const filename =
            'A-lot-of-particles.' +
            '-' +
            date.getHours() +
            '.' +
            date.getMinutes() +
            '.' +
            date.getSeconds()
        p5.save(canvas, filename, 'jpg')
    }
    p5.setup = function () {
        canvas = p5.createCanvas(2000, 2400)
        alop.init()
    }
    p5.draw = function () {
        for (let i = 0; i < prtcl.length; i++) {
            let v = {
                x: prtcl[i][0] / 3.5,
                y: prtcl[i][1] / 3.5
            }
            for (let j = 1; j < 14; j++) {
                const v1 = attr(v)
                const a1 = f * p5.noise(v1.x, v1.y)
                const v2 = { x: Math.cos(v1.y) / a1, y: Math.sin(v1.x) / a1 }
                const a3 = Math.atan2(Math.sin(v2.y), Math.sin(v2.x))

                const x = prtcl[i][0] + Math.cos(a3)
                const y = prtcl[i][1] + Math.sin(a3)
                v = { x, y }
                const _x = p5.map(x, -5, 5, 0, p5.width)
                const _y = p5.map(y, -5, 5, 0, p5.height)
                p5.fill(
                    shadeColor(
                        palette.colors[i % palette.colors.length],
                        -j * 7
                    )
                )
                p5.ellipse(_x, _y, prtcl[i][2])
            }
        }

        if (f > 10) {
            p5.noLoop()
            console.log('Done')
        }

        f++
        /* More chaotic attractor constant become variable
        window.attractors.a += 0.001
        window.attractors.b += 0.001
        window.attractors.c += 0.001
        window.attractors.d += 0.001

        if (window.attractors.a > 2) window.attractors.a = -2
        if (window.attractors.b > 2) window.attractors.b = -2
        if (window.attractors.c > 2) window.attractors.c = -2
        if (window.attractors.d > 2) window.attractors.d = -2
        */
    }
}

new p5(alop, windowFrame)
windowFrame.removeChild(loader)
window.init = alop.init
window.download_JPG = alop.download_JPG
window.infobox = infobox
handleAction()
