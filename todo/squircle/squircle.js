import ease from '../../sketch-common/ease'
import paramSlider from '../../sketch-common/param-slider'
import { generateHslaColors } from '../../sketch-common/generateHslaColors'

let radius
let colors, isRecording
const framesPerSecond = 24
const numFrame = 60
const sketchSize = () => {
    const side = Math.min(window.innerWidth, window.innerHeight)
    return {
        w: side > 800 ? 800 : side * 0.85,
        h: side > 800 ? 800 : side * 0.85
    }
}

const urlParams = new URLSearchParams(location.search)
isRecording = urlParams.get('resolution') && urlParams.get('transition')

const params = {
    transition: {
        value: urlParams.get('transition') || 5,
        options: { min: 1, max: 15, step: 0.1, label: 'Morphing smoothing' },
    },
    resolution: {
        value: urlParams.get('resolution') || 0.5,
        options: { min: 0.1, max: 0.5, step: 0.1, label: 'Resolution' },
    }
}
const gifOptions = {
    quality: 10,
    render: false,
    download: true,
    fileName: 'squircle.gif'
}
const windowFrame = document.getElementById('windowFrame')
const squircle = (p5) => {
    p5.setup = function () {
        const canvasSize = sketchSize()
        p5.createCanvas(canvasSize.w, canvasSize.h)
        p5.frameRate(framesPerSecond)
        p5.colorMode(p5.HSL, 360, 100, 100, 100)

        if (isRecording) {
            p5.createLoop({
                gif: { ...gifOptions },
                duration: numFrame / framesPerSecond,
                framesPerSecond: framesPerSecond
            })
        }
        radius = Math.min(p5.width, p5.height) / 8
        const paramBox = document.createElement('div')
        paramBox.id = 'interactiveParameter'
        for (const i in params) {
            const elems = paramSlider({...params[i], callback: window.init}, i)
            elems.forEach((elem) => {
                paramBox.appendChild(elem)
            })
        }
        const exportButton = document.createElement('input')
        exportButton.type = 'submit'
        exportButton.value = isRecording
            ? 'GIF is processing'
            : 'Download as a GIF'
        paramBox.appendChild(exportButton)
        windowFrame.appendChild(paramBox)
        squircle.init()

        p5.noFill()
    }
    p5.draw = function () {
        p5.background(0)
        const t = (p5.frameCount % numFrame) / numFrame
        const tt = t <= 0.5 ? t + t : 2 - (t + t)
        const rot = 2 * Math.PI * ease(1 - t * t, params['transition'].value)

        for (let i = 0; i < 1; i += params['resolution'].value / 4) {
            const theta1 = Math.PI * 2 * i
            const rR =
                radius *
                Math.min(
                    1 / Math.abs(Math.cos(theta1)),
                    1 / Math.abs(Math.sin(theta1))
                )

            const r = p5.lerp(radius, rR, ease(tt, params['transition'].value))

            const x = p5.width / 2 + r * Math.cos(theta1 + rot)
            const y = p5.height / 2 + r * Math.sin(theta1 + rot)

            const colorIndex = Math.round((1 / params['resolution'].value) * i)
            p5.stroke(colors[colorIndex % colors.length])
            p5.fill(colors[colorIndex % colors.length])
            p5.beginShape()
            for (let j = 0; j < 1; j += params['resolution'].value / 4) {
                const theta2 = Math.PI * 2 * j
                const _rR = radius
                Math.min(
                    1 / Math.abs(Math.cos(theta2)),
                    1 / Math.abs(Math.sin(theta2))
                )
                const _r = p5.lerp(radius, _rR / 2, ease(tt))
                const _x = x + _r * Math.cos(theta2 + rot)
                const _y = y + _r * Math.sin(theta2 + rot)

                p5.vertex(_x, _y)
            }
            p5.endShape(p5.CLOSE)
        }
    }
    squircle.init = function () {
        colors = generateHslaColors(
            80,
            60,
            50,
            Math.round(1 / params['resolution'].value)
        ).map((c) => {
            return p5.color(c[0], c[1], c[2], c[3])
        })
        p5.strokeWeight(p5.map(params['resolution'].value, 0.1, 0.5, 1.5, 3))
    }
}

export default squircle
