import SimplexNoise from 'simplex-noise'

export default (p5) => {
    let muhammad_ali_portrait, canvas
    const step = 15,
        isRecording = false,
        numFrame = 300,
        framesPerSecond = 25,
        lines = [],
        gifOptions = {
            quality: 10,
            render: false,
            download: true,
            fileName: 'the-greatest.gif'
        },
        simplex = new SimplexNoise('seed')

    p5.preload = () => {
        muhammad_ali_portrait = p5.loadImage(
            'assets/muhammad_ali_portrait-cropped.jpg'
        )
    }
    p5.setup = () => {
        canvas = p5.createCanvas(
            muhammad_ali_portrait.width,
            muhammad_ali_portrait.height
        )
        canvas.elt.style = 'width: 50%; height: auto; max-width: unset;'
        if (isRecording) {
            p5.createLoop({
                gif: { ...gifOptions },
                duration: numFrame / framesPerSecond,
                framesPerSecond: framesPerSecond
            })
        }
        //p5.noLoop()
        p5.frameRate(framesPerSecond)
        p5.stroke('white')
        p5.strokeCap(p5.SQUARE)
        for (let x = step / 2; x < p5.width; x += step) {
            for (let y = step / 2; y < p5.height; y += step) {
                lines.push({
                    thickness: Math.max(
                        1,
                        ((muhammad_ali_portrait.get(x, y)[0] / 255) * step) / 3
                    ),
                    pos: { x: x, y: y }
                })
            }
        }
    }
    p5.draw = () => {
        p5.background('black')

        const t = (p5.frameCount % numFrame) / numFrame
        const tt = t < 0.5 ? t : 1 - t
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            const noise = simplex.noise3D(
                line.pos.x / (step * 150),
                line.pos.y / (step * 150),
                tt + tt
            )
            const angle = noise * Math.PI * 2
            p5.strokeWeight(line.thickness)
            p5.line(
                line.pos.x - (Math.cos(angle) * step) / 2,
                line.pos.y - (Math.sin(angle) * step) / 2,
                line.pos.x + (Math.cos(angle) * step) / 2,
                line.pos.y + (Math.sin(angle) * step) / 2
            )
        }
    }
    p5.windowResized = () => {
        p5.resizeCanvas(window.innerWidth, window.innerHeight)
    }
}
