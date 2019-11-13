import { newExpression } from "babel-types"
// walker(x, y, stop, color)
import Walker from "./walker"

const sketch = p5 => {
    const sketchSize =
        (window.innerWidth > window.innerHeight
            ? window.innerHeight
            : window.innerWidth) * 0.75

    const randPos = () => {
        return {
            x: p5.round(p5.random(sketchSize)),
            y: p5.round(p5.random(sketchSize))
        }
    }
    const walkerNum = 5000
    let walkers = []
    let tree = []
    const margin = sketchSize /24

    p5.setup = () => {
        p5.createCanvas(sketchSize, sketchSize)
        p5.fill(0)
        tree[0] = new Walker(sketchSize / 2, sketchSize / 2, true, 0)

        for (let w = 0; w < walkerNum; w++) {
            walkers[w] = new Walker(randPos().x, randPos().y, false)
        }
    }
    p5.draw = () => {
        p5.background(255)

        for (let w = 0; w < walkerNum; w++) {
            if (walkers[w] != undefined) {
                for (let move = 0; move < 6; move++) {
                    walkers[w].walk()
                }
            }

            for (let branch = 0; branch < tree.length; branch++) {
                if (
                    p5.sq(walkers[w].x - tree[branch].x) +
                        p5.sq(walkers[w].y - tree[branch].y) <=
                    6
                ) {
                    walkers[w].stop = true
                    p5.append(tree, walkers[w])
                    walkers.splice(w, 1)
                    walkers[walkers.length] = new Walker(
                        randPos().x,
                        randPos().y,
                        false,
                        0
                    )
                }

                //p5.fill(255, 0, 0, 50)
                //p5.ellipse(walkers[w].x, walkers[w].y, 5)
            }
        }
        for (let branch = 0; branch < tree.length; branch++) {

            // const col = p5.map(branch, 0, tree.length, 0, 255)

            //p5.fill(col)
            
            p5.ellipse(tree[branch].x, tree[branch].y, 2)
            
            if( tree[branch].x < margin ||
                tree[branch].y < margin ||
                tree[branch].x >sketchSize-margin ||
                tree[branch].y > sketchSize-margin
            ) {
                p5.noLoop()
            }
        }
    }

    sketch.init = () => {}
}

export default sketch
