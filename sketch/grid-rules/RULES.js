const { sin, cos, floor, ceil, abs, sqrt, atan2, pow, random } = Math

export default [
    (i, j) => (i ^ j) === i + j || i >> j === i + j,
    //(i, j) => i ^ j && (i * j) % 4 !== j,
    (i, j) => (i + j < i) ^ j && (i + j) % 4,
    (i, j) => (i + ~j) % j << 2,
    (i, j) => (i ^ j) % ceil(random() * 10),
    (i, j) => sin(j * i) > 0.5 || abs(i - j) % 2 > 0.5,
    (i, j) => j % 5 > 1 && (i ^ j) > 2,
    (i, j) => i % 3 > 0 && j % 4 > 1,

    (i, j) => (i & j) === 0,
    (i, j) => (i | j) !== i + j,
    (i, j) => ((i & j) ^ (i | j)) % 3 > 0,

    // Fractal-like patterns
    (i, j) => (i ^ (j << 1)) % 7 < 3,
    (i, j) => ((i * j) ^ (i + j)) % 8 > 4,
    (i, j) => (i & (j << 2)) > (j & (i << 1)),

    // Wave and oscillation patterns
    (i, j) => floor(sin(i * 0.3) * cos(j * 0.3) * 4) % 2,
    (i, j) => (floor(i * cos(j * 0.2)) + j) % 5 < 2,
    (i, j) => abs(sin(i * j * 0.1)) > 0.6,

    // Spiral and circular patterns
    (i, j) => (i * i + j * j) % 13 < 6,
    (i, j) => floor(sqrt(i * i + j * j)) % 3 === 0,
    (i, j) => (atan2(j, i) * 10) % 6 < 3,

    // Complex modular patterns
    (i, j) => (i * 3 + j * 5) % 11 > (i + j * 2) % 7,
    (i, j) => ((i ^ j) + (i & j)) % 9 < 4,

    // Checkerboard variations
    (i, j) => ((i >> 1) + (j >> 2)) % 2 !== ((i >> 2) + (j >> 1)) % 2,
    (i, j) => (floor(i / 3) + floor(j / 2)) % 3 === 1,

    // Prime-like patterns
    (i, j) => ((i + 1) * (j + 1)) % 7 < 3,
    (i, j) => (i * j + i + j + 1) % 6 !== 0,

    // Maze-like patterns
    (i, j) => (i % 4 === 0 || j % 4 === 0) && (i + j) % 8 < 4,
    (i, j) => ((i >> 1) ^ (j >> 1)) % 3 > 0 && (i + j) % 5 < 3,

    // Random-influenced patterns
    (i, j) => (i ^ j) % floor(random() * 16 + 4) < floor(random() * 8 + 2),
    (i, j) => sin(i * random() * 2) * cos(j * random() * 3) > random() - 0.5,
    (i, j) => ((i + j) * random() * 10) % 7 < 3,

    // Diamond and rhombus patterns
    (i, j) => abs(i - j) % 6 < 2 || (i + j) % 8 < 3,
    (i, j) => (abs(i - 10) + abs(j - 10)) % 7 < 3,

    // Bit manipulation artistry
    (i, j) => ((i << 1) | (j >> 1)) % 5 > ((j << 1) | (i >> 1)) % 3,
    (i, j) => ((i & 0xa) ^ (j & 0xc)) !== 0,
    (i, j) =>
        (i.toString(2).split('1').length + j.toString(2).split('1').length) %
            3 >
        0,

    // Cellular automata inspired
    (i, j) => ((i + j) % 3 === 0) !== ((i * j) % 5 === 0),
    // (i, j) => (i ^ (i >> 1)) !== (j ^ (j >> 1)),

    // Mathematical sequences
    (i, j) => ((i * (i + 1)) / 2 + j) % 8 < 4,
    (i, j) => (pow(i, 2) + pow(j, 2)) % 10 < 5
]
