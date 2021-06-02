/**
 * Plane curves function: used to displace vectors
 * https://www.wolframalpha.com/widgets/view.jsp?id=4e37f43fcbe8be03c20f977f32e20d15
 *
 * For every functions
 * @param {object} 2D vector object with x & y (z will be ignored)
 * @param {float} amount the intensity of the displacement
 * @return {object} 2D vector object with x & y (z will be ignored)
 */

const archimedean_spiral = (v, amount = 1.0) => {
    const theta = Math.atan2(v.x, v.y)
    const a = 1
    const n = -3
    return {
        x: amount * -Math.sqrt(theta) * Math.cos(theta),
        y: amount * -Math.sqrt(theta) * Math.sin(theta)
    }
}

const astroid = (v, amount = 2.0) => {
    const theta = Math.atan2(v.x, v.y)
    return {
        x: Math.pow(Math.cos(theta), 3),
        y: Math.pow(Math.sin(theta), 3)
    }
}

const cardioid_pedal = (v, amount = 1.0) => {
    const theta = Math.atan2(v.x, v.y)
    return {
        x: amount * (1 + Math.cos(theta)) * Math.cos(theta),
        y: amount * (1 + Math.cos(theta)) * Math.sin(theta)
    }
}

const catenary = (v, amount = 1.0) => {
    const theta = Math.atan2(v.x, v.y)
    return {
        x: theta,
        y: Math.cosh(theta / 2.0)
    }
}

const cochleoid = (v, amount = 1.0) => {
    const theta = Math.atan2(v.x, v.y)
    const sinc = ((Math.sin(theta) * Math.PI) / theta) * Math.PI

    return {
        x: amount * sinc * Math.cos(theta),
        y: amount * sinc * Math.sin(theta)
    }
}

const conchoid_of_nicomedes = (v, amount = 1.0) => {
    const theta = Math.atan2(v.x, v.y)
    const sec = 1 / Math.cos(theta)
    return {
        x: amount * Math.cos(theta) * (Math.cos(theta) + sec),
        y: amount * Math.sin(theta) * (Math.cos(theta) + sec)
    }
}

const eight = (v, amount = 1.0) => {
    const theta = Math.atan2(v.x, v.y)
    return {
        x: amount * Math.sin(theta),
        y: amount * Math.sin(theta) * Math.cos(theta)
    }
}

const folium = (v, amount = 1.0) => {
    const theta = Math.atan2(v.x, v.y)
    return {
        x:
            amount *
            Math.pow(Math.cos(theta), 2) *
            (4 * Math.pow(Math.sin(theta), 2) - 1),
        y:
            amount *
            Math.sin(theta) *
            Math.cos(theta) *
            (4 * Math.pow(Math.sin(theta), 2) - 1)
    }
}
// from @tsulej https://generateme.wordpress.com/2016/04/11/folds/
const hyperbolic = (v, amount = 2.0) => {
    const mag = Math.sqrt(Math.pow(v.x, 2), Math.pow(v.y, 2))
    const r = mag + 1.0e-10
    const theta = Math.atan2(v.x, v.y)
    return {
        x: (amount * Math.sin(theta)) / r,
        y: amount * Math.cos(theta) * r
    }
}
// from @tsulej https://generateme.wordpress.com/2016/04/11/folds/
const julia = (v, amount = 2.0) => {
    const mag = Math.sqrt(Math.pow(v.x, 2), Math.pow(v.y, 2))
    const r = amount * Math.sqrt(mag)
    const theta =
        0.5 * Math.atan2(v.x, v.y) + Math.round(2.0 * Math.random()) * Math.PI
    return {
        x: amount * r * Math.cos(theta),
        y: amount * r * Math.sin(theta)
    }
}

const kampyle_of_euxodus = (v, amount = 1.0) => {
    const theta = Math.atan2(v.x, v.y)
    const sec = 1 / Math.cos(theta)

    return {
        x: amount * sec,
        y: amount * Math.tan(theta) * sec
    }
}

const kilroy_curve = (v, amount = 1.0) => {
    const theta = Math.atan2(v.x, v.y)
    const sinc = Math.sin(theta) / theta
    return {
        x: amount * theta,
        y: amount * Math.abs(Math.log(sinc))
    }
}

const maltese_cross = (v, amount = 1.5) => {
    const theta = Math.atan2(v.x, v.y)
    return {
        x: (amount * (2 * Math.cos(theta))) / Math.sqrt(Math.sin(4 * theta)),
        y: (amount * (2 * Math.sin(theta))) / Math.sqrt(Math.sin(4 * theta))
    }
}

const parallel_parabola = (v, amount = 1.0) => {
    const theta = Math.atan2(v.x, v.y)
    const offset = 1
    return {
        x:
            amount *
            (2 * theta + (offset * theta) / Math.sqrt(Math.pow(theta, 2) + 1)),
        y:
            amount *
            (Math.pow(theta, 2) - offset / Math.sqrt(Math.pow(theta, 2) + 1))
    }
}

const quadratix_of_hippias = (v, amount = 1.0) => {
    const theta = Math.atan2(v.x, v.y)
    const sinc = Math.sin(theta) / theta

    return {
        x: amount * ((2 * Math.cos(theta)) / (Math.PI * sinc)),
        y: amount * ((2 * Math.sin(theta)) / (Math.PI * sinc))
    }
}

const rectangular_hyperbola = (v, amount = 0.4) => {
    const theta = Math.atan2(v.x, v.y)
    const sec = 1 / Math.cos(theta)

    return { x: sec, y: Math.tan(theta) }
}
// from @tsulej https://generateme.wordpress.com/2016/04/11/folds/
const sech = (v, amount = 6.0) => {
    const cosh = (x) => {
        return 0.5 * (Math.exp(x) + Math.exp(-x))
    }
    const sinh = (x) => {
        return 0.5 * (Math.exp(x) - Math.exp(-x))
    }
    let d = Math.cos(2.0 * v.y) + cosh(2.0 * v.x)
    if (d != 0) d = (amount * 2.0) / d
    return {
        x: d * Math.cos(v.y) * cosh(v.x),
        y: -d * Math.sin(v.y) * sinh(v.x)
    }
}

const sinusoidal = (v, amount = 1.0) => {
    return { x: amount * Math.sin(v.x), y: amount * Math.sin(v.y) }
}

const superformula = (v, amount = 1.0) => {
    const theta = Math.atan2(v.x, v.y)
    const a = 1
    const b = 1
    const m = 6
    const n1 = 1
    const n2 = 7
    const n3 = 8

    const f1 = Math.pow(Math.abs(Math.cos((m * theta) / 4) / a), n2)
    const f2 = Math.pow(Math.abs(Math.sin((m * theta) / 4) / b), n3)
    const fr = Math.pow(f1 + f2, -1 / n1)

    return {
        x: Math.cos(theta) * fr * amount,
        y: Math.sin(theta) * fr * amount
    }
}
const witch_of_agnesi = (v, amount = 0.5) => {
    const theta = Math.atan2(v.x, v.y)
    return {
        x: 2 * amount * theta,
        y: (2 * amount) / Math.pow(theta, 2) + 1
    }
}

const planeCurvesFunction = {
    archimedean_spiral: archimedean_spiral,
    astroid: astroid,
    cardioid_pedal: cardioid_pedal,
    catenary: catenary,
    cochleoid: cochleoid,
    conchoid_of_nicomedes: conchoid_of_nicomedes,
    eight: eight,
    folium: folium,
    hyperbolic: hyperbolic,
    julia: julia,
    kampyle_of_euxodus: kampyle_of_euxodus,
    kilroy_curve: kilroy_curve,
    maltese_cross: maltese_cross,
    parallel_parabola: parallel_parabola,
    quadratix_of_hippias: quadratix_of_hippias,
    rectangular_hyperbola: rectangular_hyperbola,
    sech: sech,
    sinusoidal: sinusoidal,
    superformula: superformula,
    witch_of_agnesi: witch_of_agnesi
}

export default planeCurvesFunction
