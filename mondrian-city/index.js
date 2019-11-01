'use strict'
import style from '../src/sass/project.scss'

const containerElement = document.body
const loader = document.getElementById('loading')
//const paper = require('paper/dist/paper-full')
import * as paper from 'paper';
window.paper = paper;

paper.install(this);
paper.setup(new paper.Size(window.innerWidth, window.innerHeight));

var values = {
    points: 20,
    radius: 20,
    initialRadius: 10
};
for (var i = 0; i < 30; i++) {
    var path = new Path({
        fillColor: i % 2 ? 'red' : 'black',
        closed: true
    });
    var point = new Point({
        length: values.initialRadius + values.radius * i,
        angle: 0
    });
    for (var j = 0; j <= values.points; j++) {
        point.angle += 360 / values.points;
        if (j == 0) {
            path.add(view.center + point);
        } else {
            path.arcTo(view.center + point);
        }
    }
    paper.project.activeLayer.insertChild(0, path);
}