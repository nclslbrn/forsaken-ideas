import biography from './biography'
import Notification from '../../src/js/sketch-common/Notification'
const sketch = (p5) => {
    let muhammad_ali_portrait,
        canvas,
        glitchLine = 0,
        numRow = 0,
        brightnessAnimFrame = 0,
        mousePos = [false, false]

    const step = 7,
        letters = [],
        fonts = [],
        upscale = 14,
        code = [...'0123456789', ...":/*|&#@!<>'=", ...'{}[]+-^~%?;()'],
        text = biography()

    p5.preload = () => {
        muhammad_ali_portrait = p5.loadImage('assets/muhammad_ali.3@58px.jpg')
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
        canvas = p5.createCanvas(
            muhammad_ali_portrait.width * upscale,
            muhammad_ali_portrait.height * upscale
        )
        canvas.elt.style = 'background: #000; padding: 0;'
        document.getElementById('windowFrame').style = 'background: #000'
        numRow = muhammad_ali_portrait.height - 1
        p5.textAlign(p5.CENTER, p5.CENTER)
        p5.fill('white')
        p5.textSize(upscale)
        sketch.init()
    }
    sketch.init = () => {
        let i = 0
        for (let y = 0; y < numRow; y++) {
            for (let x = 0; x < numRow; x++) {
                letters.push({
                    thickness: Math.floor(
                        (muhammad_ali_portrait.get(x, y)[0] / 255) * 8
                    ),
                    pos: { x: 0.5 + x, y: 0.5 + y },
                    char: String(text[i]).toUpperCase()
                })
                i++
            }
        }
        brightnessAnimFrame = Math.floor(Math.random() * 200)
        new Notification(
            'Text : <a href="https://en.wikipedia.org/wiki/Muhammad_Ali">wikipedia</a>' +
                '<br>' +
                'Image : <a href="https://www.gettyimages.fr/photos/the-stanley-weston-archive-ali">Gettyimage</a>',
            document.getElementById('windowFrame'),
            'light'
        )
    }
    p5.draw = () => {
        p5.background('black')
        const randRow = Math.floor(Math.random() * numRow)
        const randCol = Math.floor(Math.random() * numRow)

        //const t = (p5.frameCount % brightnessAnimFrame) / brightnessAnimFrame

        for (let i = 0; i < letters.length; i++) {
            let rowIndex = Math.floor(i / numRow)
            let colIndex = Math.floor(i % numRow)
            const letter = letters[i]
            let char = letter.char
            if (glitchLine === rowIndex) {
                char = '‖'
            }
            if (glitchLine + p5.random([2, 1, -1, -2]) === rowIndex) {
                char = '□'
            }
            if (randRow === rowIndex || randCol === colIndex) {
                char = code[Math.floor(Math.random() * code.length)]
            }
            if (
                (mousePos[0] && mousePos[0] === colIndex) ||
                (mousePos[1] && mousePos[1] === rowIndex)
            ) {
                char = '+'
            }

            p5.textFont(fonts[letter.thickness])
            p5.text(char, letter.pos.x * upscale, letter.pos.y * upscale)
        }
        glitchLine++
        if (numRow === glitchLine) {
            glitchLine = 0
        }

        // console.log(mousePos)
    }
    sketch.computeMousePos = (mouseX, mouseY) => {
        const px = Math.floor(mouseX / upscale)
        const py = Math.floor(mouseY / upscale)
        mousePos = [px, py]
    }
    p5.mousePressed = () => sketch.computeMousePos(p5.mouseX, p5.mouseY)
    p5.mouseDragged = () => sketch.computeMousePos(p5.mouseX, p5.mouseY)
    p5.mouseReleased = () => {
        mousePos = [false, false]
    }
    p5.windowResized = () => {
        p5.resizeCanvas(window.innerWidth, window.innerHeight)
        sketch.init()
    }
}

export default sketch
