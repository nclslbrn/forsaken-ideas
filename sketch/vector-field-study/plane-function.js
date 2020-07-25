/**
 * Plane curves function: used to displace vectors
 * https://www.wolframalpha.com/widgets/view.jsp?id=4e37f43fcbe8be03c20f977f32e20d15
 */

export default function (p5) {
    const hyperbolic = function (v, amount = 1) {
        const r = v.mag() + 1.0e-10
        const theta = p5.atan2(v.x, v.y)
        const x = (amount * p5.sin(theta)) / r
        const y = amount * p5.cos(theta) * r
        return p5.createVector(x, y)
    }

    const rect_hyperbola = function (v, amount = 0.4) {
        const theta = p5.atan2(v.x, v.y)
        const sec = 1 / p5.cos(theta)
        return p5.createVector(sec * theta * amount, p5.tan(theta) * amount)
    }

    const sinusoidal = function (v, amount = 0.6) {
        return p5.createVector(amount * p5.sin(v.x), amount * p5.sin(v.y))
    }

    const kampyle = function (v, amount = 1) {
        const theta = p5.atan2(v.x, v.y)
        const sec = 1 / p5.cos(theta)

        return p5.createVector(sec * v.x, p5.tan(v.y) * sec * v.y)
    }

    const maltese_cross = function (v, amount = 1) {
        return p5.createVector(
            (2 * p5.cos(v.x)) / p5.sqrt(p5.sin(4 * v.x)),
            (2 * p5.sin(v.y)) / p5.sqrt(p5.sin(4 * v.y))
        )
    }

    const astroid = function (v, amount = 0.5) {
        const theta = p5.atan2(v.x, v.y)
        return p5.createVector(
            p5.pow(p5.cos(theta), 3),
            p5.pow(p5.sin(theta), 3)
        )
    }

    const kilroy_curve = function (v, amount = 0.5) {
        const theta = p5.atan2(v.x, v.y)
        const sinc = p5.sin(v.y) / v.y
        return p5.createVector(v.x, p5.log(v.y))
    }

    const conchoid = function (v, amount = 1) {
        const theta = p5.atan2(v.x, v.y)
        const sec = 1 / p5.cos(theta)
        const A = p5.ceil(p5.random(1, 2))
        const B = p5.random(0, 2)
        return p5.createVector(
            p5.cos(theta) * (A * sec * theta + B),
            p5.sin(theta) * (A * sec * theta + B)
        )
    }

    const superformula = function (v, amount = 1) {
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

    const catenary = function (v, amount = 1) {
        const theta = p5.atan2(v.x, v.y)
        return p5.createVector(v.x, Math.cosh(v.y / theta))
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
        catenary
    }
}
