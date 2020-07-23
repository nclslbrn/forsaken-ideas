const sketch = (p5) => {
    p5.setup = () => {
        p5.createCanvas(window.innerWidth, window.innerHeight)
        p5.textSize(126)
        p5.fill(p5.color('#666'))
    }
    p5.draw = () => {
        p5.background(p5.frameCount % 2 == 0 ? 255 : 0)
        if (p5.frameCount % 2 == 0) {
            p5.text('#666', p5.width / 2 - 200, p5.height / 2)
        } else {
            p5.text(
                'background(\n \tframeCount % 2 == 0 ? \n\t\t#fff : \n\t\t#000 \n)',
                0,
                200
            )
        }
    }
}
export default sketch
