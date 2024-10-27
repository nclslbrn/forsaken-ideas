export default class Particle {
  constructor(pos, col) {
    this.pos = pos
    this.acc = 0.3 + Math.random() * 3
    this.dur = Math.ceil(200  + Math.random() * 4000)
    this.age = 0,
    this.color = col
  }
}


