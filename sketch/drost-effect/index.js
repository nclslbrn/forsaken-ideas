import p5 from 'p5'
import { getPalette } from '@nclslbrn/artistry-swatch'
import Subdivision from '../../sketch-common/Subdivision'

import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')
const {round} = Math
let canvas

const droste = (p5) => {
    const cellNum = 24 + Math.round(Math.random() * 64)
    const grid = new Subdivision({
        baseSize: 0.01,
        firstCellWidth: 1,
        firstCellHeight: 1
    })
    const palette = getPalette()
    console.table(palette.meta)
    const mapX = (x, t) => {
        return p5.map(x, 0, 1, t, p5.width * t)
    }
    const mapY = (y, t) => {
        return p5.map(y, 0, 1, t, p5.height * t)
    }

    droste.init = function () {
        p5.background(palette.background)
        
        grid.init()
        for (let i = 0; i < cellNum; i++) {
            grid.subdivide()
        }

        for (let j = 1; j > 0; j -= 0.2) {

            p5.drawingContext.shadowBlur = 10 * j;
            p5.drawingContext.shadowColor = `rgba(255, 255, 255, ${j/4})`;
            p5.drawingContext.shadowOffsetX = 0;
            p5.drawingContext.shadowOffsetY = 0;
            p5.noStroke()
            p5.fill(palette.background)
            p5.rect(
                p5.width * (1-j)/2, 
                p5.height * (1-j)/2, 
                p5.width * j, 
                p5.height * j
            )
            p5.strokeWeight(j/2)
            p5.stroke(palette.stroke) 
            
            grid.cells.forEach((cell, i) => {
                const x = round(mapX(cell.x, j))
                const w = round(mapX(cell.w, j))
                const y = round(mapY(cell.y, j))
                const h = round(mapY(cell.h, j))
                p5.fill(palette.colors[i % palette.colors.length])
                p5.rect(
                    x + p5.width * 0.5 * (1-j), 
                    y + p5.height * 0.5 * (1-j), 
                    w, 
                    h,
                    4 * j
                )
            })            
            p5.noStroke()
            p5.fill(`rgba(0, 0, 0, ${j/2})`)
            p5.rect(
                p5.width * (1-j)/2, 
                p5.height * (1-j)/2, 
                p5.width * j, 
                p5.height * j
            )
        }
    }
    droste.download_JPG = function () {
        const date = new Date()
        const filename =
            'droste--effect.' +
            '-' +
            date.getHours() +
            '.' +
            date.getMinutes() +
            '.' +
            date.getSeconds()
        p5.save(canvas, filename, 'jpg')
    }
    p5.setup = function () {
        canvas = p5.createCanvas(window.innerWidth, window.innerHeight)
        droste.init()
    }
}

new p5(droste, windowFrame)
windowFrame.removeChild(loader)
window.init = droste.init
window.download_JPG = droste.download_JPG
window.infobox = infobox
handleAction()
