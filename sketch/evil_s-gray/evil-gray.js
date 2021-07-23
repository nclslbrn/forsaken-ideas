const sketch = (p5) => {
    p5.setup = () => {
        p5.createCanvas(window.innerWidth, window.innerHeight)
        p5.textFont('Helvetica Neue, Helvetica, Arial, sans-serif')
        p5.textAlign(p5.CENTER, p5.CENTER)
    }
    p5.draw = () => {
        p5.background(p5.frameCount % 3 == 0 ? 255 : 0)
        p5.textSize(p5.width / 6.5)
        p5.fill(p5.color('#666'))
        p5.text('#666', p5.width / 2, p5.height / 2)

        p5.textSize(p5.width / 45)
        p5.fill(p5.color('#CCCC52'))
        p5.text(
            'background( frameCount % 3 == 0 ? #fff :#000)',
            p5.width / 2,
            p5.height * 0.85
        )
    }
}
export default sketch
