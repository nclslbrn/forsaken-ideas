/**
 * Attractors collection
 *
 * you need to setup an attractors object in the JS file which include this one
 * window.attractors = { a: 0.1, b: 1.2, c -1.2, d: -1.8 }
 * @param {vector} v a p5.vector object with x & y (z will be ignored)
 * @param {float} amount the intensity of the displacement
 * @return {vector} a p5.vector object with x & y (z will be ignored)
 */

import p5 from 'p5'

export default function (p5) {
    const setConstants = (attractor) => {
        let a, b, c, d

        switch (attractor) {
            case 'redhead':
                a = p5.random(-1, 1)
                b = p5.random(-1, 1)
                break

            case 'clifford':
                a = p5.random(-3, 3)
                b = p5.random(-3, 3)
                c = p5.random(-3, 3)
                d = p5.random(-3, 3)
                break

            case 'de_jong':
                a = p5.random(-3, 5)
                b = p5.random(-3, 5)
                c = p5.random(-3, 5)
                d = p5.random(-3, 5)
                break

            case 'gumowski_mira':
                a = p5.random(-1, 1)
                b = p5.random(-1, 1)
                break

            case 'fractal_dream':
                a = p5.random(-3, 5)
                b = p5.random(-3, 5)
                c = p5.random(-0.5, 1.5)
                d = p5.random(-0.5, 1.5)
                break
        }
        window.attractors = { a: a, b: b, c: c, d: d }
    }

    const redhead = (v) => {
        if (window.attractors) {
            let a, b
            ;({ a, b } = window.attractors)
            return p5.createVector(
                p5.sin((v.x * v.y) / b) * (v.y + p5.cos(a * v.x - v.y)),
                v.x + p5.sin(v.y) / b
            )
        } else {
            console.error('You need to setup window.attractors')
            return v
        }
    }
    const de_jong = (v) => {
        if (window.attractors) {
            let a, b, c, d
            ;({ a, b, c, d } = window.attractors)
            return p5.createVector(
                p5.sin(a * v.y) - p5.cos(b * v.x),
                p5.sin(c * v.x) - p5.cos(d * v.y)
            )
        } else {
            console.error('You need to setup window.attractors')
            return v
        }
    }

    const clifford = (v) => {
        if (window.attractors) {
            let a, b, c, d
            ;({ a, b, c, d } = window.attractors)
            return p5.createVector(
                p5.sin(a * v.x) + c * p5.cos(a * v.x),
                p5.sin(b * v.x) + d * p5.cos(b * v.y)
            )
        } else {
            console.error('You need to setup window.attractors')
            return v
        }
    }
    const fractal_dream = (v) => {
        if (window.attractors) {
            let a, b, c, d
            ;({ a, b, c, d } = window.attractors)
            return p5.createVector(
                p5.sin(v.y * b) + c * p5.sin(v.x * b),
                p5.sin(v.x * a) + d * p5.cos(v.y * a)
            )
        } else {
            console.error('You need to setup window.attractors')
            return v
        }
    }

    const gumowski_mira = (v) => {
        if (window.attractors) {
            let a, b
            ;({ a, b } = window.attractors)

            const t = v.x
            const w = a * v.x + ((1 - a) * 2 * v.x * v.x) / (1 + v.x + v.x)
            return p5.createVector(b * v.y + w, w - t)
        } else {
            console.error('You need to setup window.attractors')
            return v
        }
    }

    return {
        init: (attractor) => setConstants(attractor),
        attractors: {
            redhead,
            de_jong,
            clifford,
            fractal_dream,
            gumowski_mira
        }
    }
}
