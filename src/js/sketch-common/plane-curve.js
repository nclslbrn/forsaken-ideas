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
    const archimedean_spiral = (v, amount = 1.0) => {
        const theta = Math.atan2(v.x, v.y)
        const a = 1
        const n = -3
        return p5.createVector(
            amount * -Math.sqrt(theta) * Math.cos(theta),
            amount * -Math.sqrt(theta) * Math.sin(theta)
        )
    }

    const astroid = (v, amount = 2.0) => {
        const theta = Math.atan2(v.x, v.y)
        return p5.createVector(
            Math.pow(Math.cos(theta), 3),
            Math.pow(Math.sin(theta), 3)
        )
    }

    const cardioid_pedal = (v, amount = 1.0) => {
        const theta = Math.atan2(v.x, v.y)
        return p5.createVector(
            amount * (1 + Math.cos(theta)) * Math.cos(theta),
            amount * (1 + Math.cos(theta)) * Math.sin(theta)
        )
    }

    const catenary = (v, amount = 1.0) => {
        const theta = Math.atan2(v.x, v.y)
        return p5.createVector(theta, Math.cosh(theta / 2.0))
    }

    const cochleoid = (v, amount = 1.0) => {
        const theta = Math.atan2(v.x, v.y)
        const sinc = ((Math.sin(theta) * p5.PI) / theta) * p5.PI

        return p5.createVector(
            amount * sinc * Math.cos(theta),
            amount * sinc * Math.sin(theta)
        )
    }

    const conchoid_of_nicomedes = (v, amount = 1.0) => {
        const theta = Math.atan2(v.x, v.y)
        const sec = 1 / Math.cos(theta)
        return p5.createVector(
            amount * Math.cos(theta) * (Math.cos(theta) + sec),
            amount * Math.sin(theta) * (Math.cos(theta) + sec)
        )
    }

    const eight = (v, amount = 1.0) => {
        const theta = Math.atan2(v.x, v.y)
        return p5.createVector(
            amount * Math.sin(theta),
            amount * Math.sin(theta) * Math.cos(theta)
        )
    }

    const folium = (v, amount = 1.0) => {
        const theta = Math.atan2(v.x, v.y)
        return p5.createVector(
            amount *
                Math.pow(Math.cos(theta), 2) *
                (4 * Math.pow(Math.sin(theta), 2) - 1),
            amount *
                Math.sin(theta) *
                Math.cos(theta) *
                (4 * Math.pow(Math.sin(theta), 2) - 1)
        )
    }
    // from @tsulej https://generateme.wordpress.com/2016/04/11/folds/
    const hyperbolic = (v, amount = 2.0) => {
        const r = v.mag() + 1.0e-10
        const theta = Math.atan2(v.x, v.y)
        return p5.createVector(
            (amount * Math.sin(theta)) / r,
            amount * Math.cos(theta) * r
        )
    }
    // from @tsulej https://generateme.wordpress.com/2016/04/11/folds/
    const julia = (v, amount = 2.0) => {
        const r = amount * p5.sqrt(v.mag())
        const theta =
            0.5 * Math.atan2(v.x, v.y) +
            Math.round(2.0 * Math.random()) * Math.PI
        return p5.createVector(
            amount * r * Math.cos(theta),
            amount * r * Math.sin(theta)
        )
    }

    const kampyle_of_euxodus = (v, amount = 1.0) => {
        const theta = Math.atan2(v.x, v.y)
        const sec = 1 / Math.cos(theta)

        return p5.createVector(amount * sec, amount * Math.tan(theta) * sec)
    }

    const kilroy_curve = (v, amount = 1.0) => {
        const theta = Math.atan2(v.x, v.y)
        const sinc = Math.sin(theta) / theta
        return p5.createVector(
            amount * theta,
            amount * Math.abs(Math.log(sinc))
        )
    }

    const maltese_cross = (v, amount = 1.5) => {
        const theta = Math.atan2(v.x, v.y)
        return p5.createVector(
            (amount * (2 * Math.cos(theta))) / Math.sqrt(Math.sin(4 * theta)),
            (amount * (2 * Math.sin(theta))) / Math.sqrt(Math.sin(4 * theta))
        )
    }

    const parallel_parabola = (v, amount = 1.0) => {
        const theta = Math.atan2(v.x, v.y)
        const offset = 1
        return p5.createVector(
            amount *
                (2 * theta +
                    (offset * theta) / Math.sqrt(Math.pow(theta, 2) + 1)),
            amount *
                (Math.pow(theta, 2) -
                    offset / Math.sqrt(Math.pow(theta, 2) + 1))
        )
    }

    const quadratix_of_hippias = (v, amount = 1.0) => {
        const theta = Math.atan2(v.x, v.y)
        const sinc = Math.sin(theta) / theta

        return p5.createVector(
            amount * ((2 * Math.cos(theta)) / (Math.PI * sinc)),
            amount * ((2 * Math.sin(theta)) / (Math.PI * sinc))
        )
    }

    const rectangular_hyperbola = (v, amount = 0.4) => {
        const theta = Math.atan2(v.x, v.y)
        const sec = 1 / Math.cos(theta)

        return p5.createVector(sec, Math.tan(theta))
    }
    // from @tsulej https://generateme.wordpress.com/2016/04/11/folds/
    const sech = (v, amount = 6.0) => {
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
        return p5.createVector(amount * Math.sin(v.x), amount * Math.sin(v.y))
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

        return p5.createVector(
            p5.cos(theta) * fr * amount,
            p5.sin(theta) * fr * amount
        )
    }
    const witch_of_agnesi = (v, amount = 0.5) => {
        const theta = p5.atan2(v.x, v.y)
        return p5.createVector(
            2 * amount * theta,
            (2 * amount) / Math.pow(theta, 2) + 1
        )
    }

    return {
        archimedean_spiral,
        astroid,
        cardioid_pedal,
        catenary,
        cochleoid,
        conchoid_of_nicomedes,
        eight,
        folium,
        hyperbolic,
        julia,
        kampyle_of_euxodus,
        kilroy_curve,
        maltese_cross,
        parallel_parabola,
        quadratix_of_hippias,
        rectangular_hyperbola,
        sech,
        sinusoidal,
        superformula,
        witch_of_agnesi
    }
}
