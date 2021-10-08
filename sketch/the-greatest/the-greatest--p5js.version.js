import biography from './biography'
import Notification from '../../src/js/sketch-common/Notification'
export default (p5) => {
    let muhammad_ali_portrait, canvas
    const step = 7,
        letters = [],
        fonts = [],
        upscale = 2,
        code = [...'0123456789', ...":/*|&#@!<>'=", ...'{}[]+-^~%?;()'],
        text = biography()

    p5.preload = () => {
        muhammad_ali_portrait = p5.loadImage('assets/muhammad_ali.3@400px.jpg')
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
        canvas.elt.style = 'background: #000;'
        p5.textAlign(p5.CENTER, p5.CENTER)
        p5.fill('white')
        p5.textSize(Math.round(step * upscale))

        let i = 0
        for (let y = step / 2; y < muhammad_ali_portrait.width; y += step) {
            for (
                let x = step / 2;
                x < muhammad_ali_portrait.height;
                x += step
            ) {
                letters.push({
                    thickness: Math.floor(
                        (muhammad_ali_portrait.get(x, y)[0] / 255) * 8
                    ),
                    pos: { x: x * upscale, y: y * upscale },
                    char: String(text[i]).toUpperCase()
                })
                i++
            }
        }
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
        for (let i = 0; i < letters.length; i++) {
            const letter = letters[i]
            p5.textFont(fonts[letter.thickness])
            p5.text(letter.char, letter.pos.x, letter.pos.y)
        }
        const randomChar = Math.floor(Math.random() * letters.length)
        letters[randomChar].char = code[Math.floor(Math.random() * code.length)]
    }
    p5.windowResized = () => {
        p5.resizeCanvas(window.innerWidth, window.innerHeight)
    }
}
