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
    const agnesi_witch = (v, amount = 0.5) => {
        const theta = p5.atan2(v.x, v.y)
        return p5.createVector(
            2 * amount * theta,
            (2 * amount) / p5.sqrt(theta) + 1
        )
    }

    const archimedean_spiral = (v, amount = 3.0) => {
        const theta = p5.atan2(v.x, v.y)
        return p5.createVector(amount * p5.cos(theta), amount * p5.sin(theta))
    }

    const astroid = (v, amount = 2.0) => {
        const theta = p5.atan2(v.x, v.y)
        return p5.createVector(
            p5.pow(p5.cos(theta), 3),
            p5.pow(p5.sin(theta), 3)
        )
    }

    const cardioid_pedal = (v, amount = 1.0) => {
        const theta = p5.atan2(v.x, v.y)
        return p5.createVector(
            amount * (1 + p5.cos(theta)) * p5.cos(theta),
            amount * (1 + p5.cos(theta)) * p5.sin(theta)
        )
    }

    const catenary = (v, amount = 1.5) => {
        const theta = p5.atan2(v.x, v.y)
        return p5.createVector(v.x, Math.cosh(v.y / theta))
    }

    const cochlioid = (v, amount = 1.2) => {
        const theta = p5.atan2(v.x, v.y)
        const sinc = p5.sin(v.y) / v.y
        return p5.createVector(
            amount * sinc * p5.cos(theta),
            amount * sinc * p5.sin(theta)
        )
    }

    const conchoid = (v, amount = 1.5) => {
        const theta = p5.atan2(v.x, v.y)
        const sec = 1 / p5.cos(theta)
        const A = p5.ceil(p5.random(1, 2))
        const B = p5.random(0, 2)
        return p5.createVector(
            p5.cos(theta) * (A * sec * theta + B),
            p5.sin(theta) * (A * sec * theta + B)
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

    const hyperbolic = (v, amount = 2.0) => {
        const r = v.mag() + 1.0e-10
        const theta = p5.atan2(v.x, v.y)
        const x = (amount * p5.sin(theta)) / r
        const y = amount * p5.cos(theta) * r
        return p5.createVector(x, y)
    }

    const julia = (v, amount = 2.0) => {
        const r = amount * p5.sqrt(v.mag())
        const theta =
            0.5 * p5.atan2(v.x, v.y) + p5.round(2.0 * p5.random(0, 1)) * p5.PI
        const x = r * p5.cos(theta)
        const y = r * p5.sin(theta)
        return p5.createVector(x, y)
    }

    const kampyle = (v, amount = 1.0) => {
        const theta = p5.atan2(v.x, v.y)
        const sec = 1 / p5.cos(theta)

        return p5.createVector(sec * v.x, p5.tan(v.y) * sec * v.y)
    }

    const kilroy_curve = (v, amount = 1.0) => {
        const sinc = p5.sin(v.y) / v.y
        return p5.createVector(v.x, p5.log(sinc * v.y))
    }

    const maltese_cross = (v, amount = 1.5) => {
        return p5.createVector(
            (2 * p5.cos(v.x)) / p5.sqrt(p5.sin(4 * v.x)),
            (2 * p5.sin(v.y)) / p5.sqrt(p5.sin(4 * v.y))
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

    const rect_hyperbola = (v, amount = 0.4) => {
        const theta = p5.atan2(v.x, v.y)
        const sec = 1 / p5.cos(theta)
        return p5.createVector(sec * theta * amount, p5.tan(theta) * amount)
    }

    const sech = (v, amount = 0.2) => {
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

    const sinusoidal = (v, amount = 1.0) => {
        return p5.createVector(amount * p5.sin(v.x), amount * p5.sin(v.y))
    }

    const superformula = (v, amount = 1.0) => {
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

    return {
        agnesi_witch,
        archimedean_spiral,
        astroid,
        cardioid_pedal,
        catenary,
        cochlioid,
        conchoid,
        hippias_quadratix,
        hyperbolic,
        julia,
        kampyle,
        kilroy_curve,
        maltese_cross,
        parallel_parabola,
        rect_hyperbola,
        sech,
        sinusoidal,
        superformula
    }
}
