/// <reference path="../../node_modules/@types/p5/global.d.ts" />
const sketch = (p5) => {
    p5.setup = () => {
        p5.createCanvas(window.innerWidth, window.innerHeight)
        p5.background(255)
        console.log('Hello from p5')
    }
    p5.draw = () => {}
    p5.windowResized = () => {
        p5.resizeCanvas(window.innerWidth, window.innerHeight)
    }
}
export default sketch
