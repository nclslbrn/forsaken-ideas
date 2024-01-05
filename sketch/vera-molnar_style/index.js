import p5 from 'p5';
import '../framed-canvas.css';
import infobox from '../../sketch-common/infobox';
import handleAction from '../../sketch-common/handle-action';
import Notification from '../../sketch-common/Notification';


const windowFrame = document.getElementById('windowFrame');
const loader = document.getElementById('loading');
let scribles, canvas, f
const {round, ceil, random, PI, cos, sin, atan2, hypot} = Math
const molnar = (p5) => {
    molnar.init = function () {
        const rows = 16 + round(random() * 16),
        diagLinesNum = 48 + round(random() * 56),
        margin = p5.width * 0.1,
        step = (p5.height * 0.8) /  rows,
        obliques = [],
        horizontals = [];

        const scribleLine = (line) => {
            const scrible = []
            const l = atan2(line[1][1] - line[0][1], line[1][0] - line[0][0])
            const s = ceil(hypot(line[1][0] - line[0][0], line[1][1] - line[0][1]))
            for (let i = 0; i <= s; i++) {
                const nR = i/s * PI * 2
                const n = p5.noise(cos(nR), sin(nR)) * 0.025
                scrible.push([
                    round(line[0][0] + cos(l + n) * i), 
                    round(line[0][1] + sin(l + n) * i)
                ])
            }
            return scrible
        }
        p5.smooth(10);
        p5.background('#eeedef');
        p5.noFill();
        p5.stroke('#333');

        for (let y = 0; y < rows; y++) {
            const line = [
                [ margin/2 + random() * margin * 2, margin + y*step], 
                [ p5.width - (margin/2 * (1+random() * 2)), margin + y*step]
            ],
                numCuts = round(random() * 6),
                lineLen = line[1][0] - line[0][0],
                cutLen = lineLen / numCuts;
            
            if (numCuts) {
                for (let c = 0; c < numCuts; c++) {
                    const subLine = [
                        [
                            line[0][0] + (cutLen * c),
                            line[0][1]
                        ], [
                            line[0][0] + (cutLen * (c+1)) - random() * cutLen * 0.2,
                            line[1][1]
                        ] 
                    ]
                    horizontals.push(subLine)
                }
            } else {
                horizontals.push(line)
            }
        }

        for (let i = 0; i < diagLinesNum; i++) {
            const b = [
                margin + random() * (p5.width - margin * 2.8), 
                margin * 2 + random() * (p5.height - margin * 3)
            ]
            const l = PI * p5.random(1.5, 2)
            const s = margin * random() * 2

            const e = [b[0] + cos(l) * s, b[1] + sin(l) * s]

            obliques.push([b, e])
        }
        f = 0
        scribles = [...obliques, ...horizontals].map(line => scribleLine(line))
        p5.loop()
    }

    molnar.download_JPG = function () {
        const date = new Date()
        const filename =
            'Vera-Molnar\' style.' +
            '-' +
            date.getHours() +
            '.' +
            date.getMinutes() +
            '.' +
            date.getSeconds()
        p5.save(canvas, filename, 'jpg')
    }
    p5.setup = function () {
        const s = Math.min(window.innerWidth, window.innerHeight)
        canvas = p5.createCanvas(s, s)
        molnar.init()
    }
    p5.draw = function() {
        for(const line of scribles) {
            if (line.length > f && line[f] && line[f+1]) {
                p5.beginShape();
                p5.vertex(line[f][0], line[f][1])
                p5.vertex(line[f+1][0], line[f+1][1])
                p5.endShape();
            }
        }
        if (!scribles.reduce((moreThanFrame, line) => line.length > f || moreThanFrame, false)) {
            new Notification('Drawing done, do you want to <button onclick="window.init()">generate another</button> ?', windowFrame, 'light')
            p5.noLoop();
        }
        f++
    }
}

new p5(molnar, windowFrame)
windowFrame.removeChild(loader)
window.init = molnar.init
window.download_JPG = molnar.download_JPG
window.infobox = infobox
handleAction()
