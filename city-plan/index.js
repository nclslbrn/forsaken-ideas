import style from '../src/sass/project.scss'
import p5 from "p5"
import colourscafe from '../tools/chromotone/palettes/colourscafe'
const pallette_id = Math.floor(Math.random() * 7)
const pallette = colourscafe[pallette_id].colors

////////////////////////////////////////////////////
const containerElement = document.body
const loader = document.getElementById('p5_loading')
////////////////////////////////////////////////////
const sketch = (p5) => {

    const roads = []
    const builds = []


    p5.setup = () => {
        p5.createCanvas(window.innerWidth, window.innerHeight)
        p5.background(colourscafe[pallette_id].background)
        p5.noStroke();
    }

    p5.draw = () => {
        p5.fill(colourscafe[pallette_id].colors[p5.int(colourscafe[pallette_id].colors.length * p5.random(1))])
        p5.rect(
            p5.random(1) * window.innerWidth,
            p5.random(1) * window.innerHeight,
            p5.random(2, 8),
            p5.random(2, 8)
        )
    }

}
////////////////////////////////////////////////////
const P5 = new p5(sketch, containerElement)
document.body.removeChild(loader)
////////////////////////////////////////////////////