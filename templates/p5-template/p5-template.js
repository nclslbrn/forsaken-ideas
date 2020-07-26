/// <reference path="../../node_modules/@types/p5/global.d.ts" />
const sketch = (p5) => {
    p5.setup = () => {
        p5.createCanvas(600, 600)
        p5.background(255)
        console.log('Hello from p5')
    }
    p5.draw = () => {}
}
export default sketch
