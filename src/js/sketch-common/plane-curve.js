/**
 * Plane curves function: used to displace vectors
 * https://www.wolframalpha.com/widgets/view.jsp?id=4e37f43fcbe8be03c20f977f32e20d15
 *
 * For every functions
 * @param {vector} v a p5.vector object with x & y (z will be ignored)
 * @param {float} amount the intensity of the displacement
 * @return {vector} a p5.vector object with x & y (z will be ignored)
 */

import p5 from 'p5'

export default function (p5) {
    const hyperbolic = (v, amount = 1) => {
        const r = v.mag() + 1.0e-10
        const theta = p5.atan2(v.x, v.y)
        const x = (amount * p5.sin(theta)) / r
        const y = amount * p5.cos(theta) * r
        return p5.createVector(x, y)
    }

    const rect_hyperbola = (v, amount = 0.4) => {
        const theta = p5.atan2(v.x, v.y)
        const sec = 1 / p5.cos(theta)
        return p5.createVector(sec * theta * amount, p5.tan(theta) * amount)
    }

    const sinusoidal = (v, amount = 0.6) => {
        return p5.createVector(amount * p5.sin(v.x), amount * p5.sin(v.y))
    }

    const kampyle = (v, amount = 1) => {
        const theta = p5.atan2(v.x, v.y)
        const sec = 1 / p5.cos(theta)

        return p5.createVector(sec * v.x, p5.tan(v.y) * sec * v.y)
    }

    const maltese_cross = (v, amount = 1) => {
        return p5.createVector(
            (2 * p5.cos(v.x)) / p5.sqrt(p5.sin(4 * v.x)),
            (2 * p5.sin(v.y)) / p5.sqrt(p5.sin(4 * v.y))
        )
    }

    const astroid = (v, amount = 0.5) => {
        const theta = p5.atan2(v.x, v.y)
        return p5.createVector(
            p5.pow(p5.cos(theta), 3),
            p5.pow(p5.sin(theta), 3)
        )
    }

    const kilroy_curve = (v, amount = 0.5) => {
        const sinc = p5.sin(v.y) / v.y
        return p5.createVector(v.x, p5.log(sinc * v.y))
    }

    const conchoid = (v, amount = 1) => {
        const theta = p5.atan2(v.x, v.y)
        const sec = 1 / p5.cos(theta)
        const A = p5.ceil(p5.random(1, 2))
        const B = p5.random(0, 2)
        return p5.createVector(
            p5.cos(theta) * (A * sec * theta + B),
            p5.sin(theta) * (A * sec * theta + B)
        )
    }

    const cochlioid = (v, amount = 0.75) => {
        const theta = p5.atan2(v.x, v.y)
        const sinc = p5.sin(v.y) / v.y
        return p5.createVector(
            amount * sinc * p5.cos(theta),
            amount * sinc * p5.sin(theta)
        )
    }

    const superformula = (v, amount = 1) => {
        const theta = p5.atan2(v.x, v.y)
        const a = 1
        const b = 1
        const m = 6
        const n1 = 1
        const n2 = 7
        const n3 = 8

        const f1 = p5.pow(p5.abs(p5.cos((m * theta) / 4) / a), n2)
        const f2 = p5.pow(p5.abs(p5.sin((m * theta) / 4) / b), n3)
        const fr = p5.pow(f1 + f2, -1 / n1)

        return p5.createVector(p5.cos(theta) * fr, p5.sin(theta) * fr)
    }

    const catenary = (v, amount = 1) => {
        const theta = p5.atan2(v.x, v.y)
        return p5.createVector(v.x, Math.cosh(v.y / theta))
    }

    const archimedean_spiral = (v, amount = 0.75) => {
        const theta = p5.atan2(v.x, v.y)
        return p5.createVector(amount * p5.cos(theta), amount * p5.sin(theta))
    }

    const julia = (v, amount = 3.0) => {
        const r = amount * p5.sqrt(v.mag())
        const theta =
            0.5 * p5.atan2(v.x, v.y) + p5.round(2.0 * p5.random(0, 1)) * p5.PI
        const x = r * p5.cos(theta)
        const y = r * p5.sin(theta)
        return p5.createVector(x, y)
    }

    const sech = (v, amount = 1.0) => {
        const cosh = (x) => {
            return 0.5 * (p5.exp(x) + p5.exp(-x))
        }
        const sinh = (x) => {
            return 0.5 * (p5.exp(x) - p5.exp(-x))
        }
        let d = p5.cos(2.0 * v.y) + cosh(2.0 * v.x)
        if (d != 0) d = (amount * 2.0) / d
        return p5.createVector(
            d * p5.cos(v.y) * cosh(v.x),
            -d * p5.sin(v.y) * sinh(v.x)
        )
    }

    const cardioid_pedal = (v, amount = 1.0) => {
        const theta = p5.atan2(v.x, v.y)
        return p5.createVector(
            amount * (1 + p5.cos(theta)) * p5.cos(theta),
            amount * (1 + p5.cos(theta)) * p5.sin(theta)
        )
    }

    const agnesi_witch = (v, amount = 1.0) => {
        const theta = p5.atan2(v.x, v.y)
        return p5.createVector(
            2 * amount * theta,
            (2 * amount) / p5.sqrt(theta) + 1
        )
    }

    const hippias_quadratix = (v, amount = 1.0) => {
        const theta = p5.atan2(v.x, v.y)
        const sinc = p5.sin(v.y) / v.y

        return p5.createVector(
            (2 * amount * p5.cos(theta)) / (p5.PI * sinc * theta),
            (2 * amount * p5.sin(theta)) / (p5.PI * sinc * theta)
        )
    }

    const parallel_parabola = (v, amount = 1.0) => {
        const theta = p5.atan2(v.x, v.y)
        const offset = 1
        return p5.createVector(
            2 * amount * theta + (offset * theta) / p5.sqrt(theta * theta + 1),
            amount * theta * theta - offset / p5.sqrt(theta * theta + 1)
        )
    }

    return {
        hyperbolic,
        rect_hyperbola,
        sinusoidal,
        kampyle,
        maltese_cross,
        astroid,
        kilroy_curve,
        conchoid,
        superformula,
        catenary,
        julia,
        sech,
        cardioid_pedal,
        archimedean_spiral,
        cochlioid,
        agnesi_witch,
        hippias_quadratix,
        parallel_parabola
    }
}
