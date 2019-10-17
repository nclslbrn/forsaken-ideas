//import p5 from 'p5';
require('expose-loader?p5!p5');
const containerElement = document.body
const loader = document.getElementById('p5_loading')


const sketch = (p) => {
    let x = 100
    let y = 100

    p.setup = function() {
        p.createCanvas(window.innerWidth, window.innerHeight)
    }

    p.draw = function() {
        p.background(0)
        p.fill(255)
        p.rect(x, y, 50, 50)
    }
}

new p5(sketch, containerElement)
//document.body.removeChild(loader)


console.log('this is project 2')