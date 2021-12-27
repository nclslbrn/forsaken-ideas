import biography from './biography'
import Notification from '../../src/js/sketch-common/Notification'

const sketch = (p5) => {
    let canvas,
        upscale,
        t = 0,
        portraitId = 0,
        numRow = 0,
        muhammad_ali_portrait = [],
        rippleCenter = [false, false],
        letters = [],
        nextLettersThickness = []

    const fonts = [],
        code = [...'0123456789', ...":/*|&#@!<>'=", ...'{}[]+-^~%?;()'],
        text = biography()

    sketch.canvasSize = (isResize = false) => {
        const size = window.innerWidth < 800 ? window.innerWidth * 0.8 : 800
        upscale = size / 58
        if (isResize) {
            p5.resizeCanvas(size, size)
        } else {
            canvas = p5.createCanvas(size, size)
        }
    }
    p5.preload = () => {
        muhammad_ali_portrait = [
            p5.loadImage('assets/muhammad_ali.0@58px.jpg'),
            p5.loadImage('assets/muhammad_ali.1@58px.jpg'),
            p5.loadImage('assets/muhammad_ali.2@58px.jpg'),
            p5.loadImage('assets/muhammad_ali.3@58px.jpg')
        ]

        fonts[0] = p5.loadFont('assets/Inter-Thin.otf')
        fonts[1] = p5.loadFont('assets/Inter-ExtraLight.otf')
        fonts[2] = p5.loadFont('assets/Inter-Light.otf')
        fonts[3] = p5.loadFont('assets/Inter-Regular.otf')
        fonts[4] = p5.loadFont('assets/Inter-Medium.otf')
        fonts[5] = p5.loadFont('assets/Inter-SemiBold.otf')
        fonts[6] = p5.loadFont('assets/Inter-Bold.otf')
        fonts[7] = p5.loadFont('assets/Inter-ExtraBold.otf')
        fonts[8] = p5.loadFont('assets/Inter-Black.otf')
    }
    p5.setup = () => {
        sketch.canvasSize()
        canvas.elt.style = 'padding: 0; max-width: 100vw; height: auto;'
        numRow = muhammad_ali_portrait[0].height - 1
        rippleCenter = [
            Math.floor(Math.random() * numRow),
            Math.floor(Math.random() * numRow)
        ]
        p5.textAlign(p5.CENTER, p5.CENTER)
        p5.fill('white')
        p5.textSize(upscale)
        sketch.init(portraitId)

        new Notification(
            'Text : <a href="https://en.wikipedia.org/wiki/Muhammad_Ali">wikipedia</a>' +
                '<br>' +
                'Image : <a href="https://www.gettyimages.fr/photos/the-stanley-weston-archive-ali">Gettyimage</a>',
            document.getElementById('windowFrame'),
            'light'
        )
    }
    sketch.init = (pId) => {
        letters = []
        nextLettersThickness = []
        for (let y = 0; y < numRow; y++) {
            for (let x = 0; x < numRow; x++) {
                const i = y * numRow + x
                letters.push({
                    thickness: Math.floor(
                        (muhammad_ali_portrait[pId].get(x, y)[0] / 255) * 8
                    ),
                    pos: { x: x, y: y },
                    char: String(text[i]).toUpperCase()
                })
                nextLettersThickness.push(
                    Math.floor(
                        (muhammad_ali_portrait[
                            pId + 1 === muhammad_ali_portrait.length
                                ? 0
                                : pId + 1
                        ].get(x, y)[0] /
                            255) *
                            8
                    )
                )
            }
        }
    }
    p5.draw = () => {
        p5.background('black')
        const randRow = Math.floor(Math.random() * numRow)
        const randCol = Math.floor(Math.random() * numRow)
        for (let i = 0; i < letters.length; i++) {
            let rowIndex = Math.floor(i / numRow)
            let colIndex = Math.floor(i % numRow)
            const letter = letters[i]
            let char = letter.char
            let thickness = letter.thickness
            if (t < rowIndex) {
                thickness = nextLettersThickness[i]
            }
            if (t === rowIndex) {
                char = '‖'
            }
            if (t + p5.random([2, 1, -1, -2]) === rowIndex) {
                char = '□'
            }
            if (randRow === rowIndex || randCol === colIndex) {
                char = code[Math.floor(Math.random() * code.length)]
            }

            if (rippleCenter[0] && rippleCenter[1]) {
                const j = Math.sqrt(
                    (letter.pos.x - rippleCenter[0]) ** 2 +
                        (letter.pos.y - rippleCenter[1]) ** 2
                )
                if (j < t && j > t - 2) {
                    char = code[Math.floor(Math.random() * code.length)]
                    //char = '█'
                }
            }

            p5.textFont(fonts[thickness])
            p5.text(
                char,
                (1 + letter.pos.x) * upscale,
                (1 + letter.pos.y) * upscale
            )
        }
        t++

        if (numRow === t) {
            t = 0
            portraitId++
            rippleCenter = [
                Math.floor(Math.random() * numRow),
                Math.floor(Math.random() * numRow)
            ]
            if (portraitId == muhammad_ali_portrait.length) portraitId = 0
            console.log(portraitId)
            sketch.init(portraitId)
        }

        // console.log(mousePos)
    }
    /* sketch.computeMousePos = (mouseX, mouseY) => {
        const px = Math.floor(mouseX / upscale)
        const py = Math.floor(mouseY / upscale)
        mousePos = [px, py]
    }
    p5.mousePressed = () => sketch.computeMousePos(p5.mouseX, p5.mouseY)
    p5.mouseDragged = () => sketch.computeMousePos(p5.mouseX, p5.mouseY)
    p5.mouseReleased = () => {
        mousePos = [false, false]
        rippleLength = 1
    } */
    p5.windowResized = () => {
        sketch.canvasSize(true)
        sketch.init()
    }
}

export default sketch
