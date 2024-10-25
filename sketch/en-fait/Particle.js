export default class Particle {
  constructor(pos) {
    this.pos = pos
    this.acc = Math.random()
    this.dur = Math.ceil(300  + Math.random() * 1000)
    this.age = 0
  }
}


