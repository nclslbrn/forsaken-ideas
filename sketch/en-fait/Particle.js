export default class Particle {
  constructor(pos, col) {
    this.pos = pos
    this.acc = 0.3 + Math.random() * 3
    this.dur = Math.ceil(50  + Math.random() * 2000)
    this.age = 0,
    this.color = col
  }
}


