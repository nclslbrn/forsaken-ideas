import p5 from 'p5'

export default function (p5) {
    const joinVectorFuncs = {
        add: (v1, v2) => {
            return p5.createVector(v1.x + v2.x, v1.y + v2.y)
        },
        sub: (v1, v2) => {
            return p5.createVector(v1.x - v2.x, v1.y - v2.y)
        },
        mul: (v1, v2) => {
            return p5.createVector(v1.x * v2.x, v1.y * v2.y)
        },
        div: (v1, v2) => {
            return p5.createVector(
                v2.x !== 0 ? v1.x / v2.x : 0,
                v2.y !== 0 ? v1.y / v2.y : 0
            )
        }
    }
    const joinVectorFuncsNames = Object.entries(joinVectorFuncs).map(
        (func_name) => {
            return func_name[0]
        }
    )
    const getOperatorSymbol = (joinFunc) => {
        const conversion = {
            add: '+',
            sub: '-',
            mul: '*',
            div: '/'
        }
        if (joinFunc in conversion) {
            return conversion[joinFunc]
        } else {
            return ':-('
        }
    }

    return { joinVectorFuncs, joinVectorFuncsNames, getOperatorSymbol }
}
