const sketch = (p5) => {
    p5.setup = () => {
        p5.createCanvas(window.innerWidth, window.innerHeight)
        p5.textFont('Helvetica Neue, Helvetica, Arial, sans-serif')
    }
    p5.draw = () => {
        p5.background(p5.frameCount % 3 == 0 ? 255 : 0)

        p5.textSize(200)
        p5.fill(p5.color('#666'))
        p5.text('#666', p5.width / 2 - 250, p5.height / 2)

        p5.textSize(28)
        p5.fill(p5.color('#CCCC52'))
        p5.text(
            'background( frameCount % 3 == 0 ? #fff :#000)',
            p5.width / 2 - 305,
            p5.height - 64
        )
    }
}
export default sketch
