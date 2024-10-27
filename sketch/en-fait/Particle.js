export default class Particle {
  constructor(pos, col) {
    this.pos = pos
    this.acc = 0.3 + Math.random() * 4
    this.dur = Math.ceil(200  + Math.ceil(Math.random() * 1300))
    this.age = 200, // tweeakl opacity
    this.color = col
  }
}


