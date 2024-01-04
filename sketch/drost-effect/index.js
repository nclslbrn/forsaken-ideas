import p5 from 'p5'
import { getPalette } from '@nclslbrn/artistry-swatch'
import Subdivision from '../../sketch-common/Subdivision'

import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'

const windowFrame = document.getElementById('windowFrame')
const loader = document.getElementById('loading')

let canvas

const droste = (p5) => {
    const cellNum = 12 + Math.round(Math.random() * 24)
    const grid = new Subdivision({
        baseSize: 0.03,
        firstCellWidth: 1,
        firstCellHeight: 1
    })
    const palette = getPalette()
    const mapX = (x) => {
        return p5.map(x, 0, 1, p5.width * 0.025, p5.width * 0.95)
    }
    const mapY = (y) => {
        return p5.map(y, 0, 1, p5.height * 0.025, p5.height * 0.95)
    }
    const cellIterator = (w, h) => {
        const items = []
        if (w > h) {
            const s = w / h
            for (let x = 0; x <
        } else {
            s = h / w
            S = h
        }
        for (let i = 0; i < S; i += s) {
            occurency.push(
                w > h ? [[s / 2 + i, s / 2], s] : [[s / 2, s / 2 + i], s]
            )
        }
        return occurency
    }

    droste.init = function () {
        p5.background(palette.background)
        p5.stroke(palette.stroke)
        grid.init()
        for (let i = 0; i < cellNum; i++) {
            grid.subdivide()
        }
        grid.cells.forEach((cell, i) => {
            const x = Math.round(mapX(cell.x))
            const w = Math.round(mapX(cell.w))
            const y = Math.round(mapY(cell.y))
            const h = Math.round(mapY(cell.h))
            p5.fill(palette.colors[cell.depth % palette.colors.length])
            //p5.rect(x, y, w, h)

            const items = cellIterator(w, h)
            items.forEach((item) => {
                console.log(item)
                const [pos, size] = item
                const d = size / 3
                if (i === 0) {
                    p5.triangle(
                        x + pos[0] - d,
                        y + pos[1] + d,
                        x + pos[0],
                        y + pos[1] - d,
                        x + pos[0] + d,
                        y + pos[1] + d
                    )
                } else if (i === 1) {
                    p5.ellipse(x + pos[0], y + pos[1], d)
                } else if (i === 2) {
                    p5.rect(x + pos[0], y + pos[1], d)
                }
            })
        })
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
