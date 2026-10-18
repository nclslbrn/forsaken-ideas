
import { ANGLES } from './CONST'
import { repeatedly } from "@thi.ng/transducers"
import { pickRandom } from '@thi.ng/random'
const { cos, sin, PI, ceil, hypot } = Math

const rotateAround = ([x, y], [cx, cy], a) => {
    const c = cos(a),
        s = sin(a),
        dx = x - cx,
        dy = y - cy
    return [cx + dx * c - dy * s, cy + dx * s + dy * c]
}

const buildLineLayer = (
    numLayer,
    size,
    margin,
    amplitude,
    rand,
    props
) => [
    ...repeatedly(() => {
        const angle = pickRandom(ANGLES, rand),
            isDiagonal = angle % (PI / 2) !== 0,
            center = [margin + size[0] / 2, margin + size[1] / 2],
            diag = hypot(size[0], size[1]),
            // len = length of each line, stack = extent they are spread across
            [len, stack] = isDiagonal
                ? [diag, diag]
                : angle === 0
                  ? [size[0], size[1]]
                  : [size[1], size[0]],
            stepNum = rand.minmaxInt(...props.ptPerLine),
            steps = Array.from(Array(stepNum)).map(() => rand.float() * 10),
            sum = steps.reduce((acc, val) => acc + val, 0),
            normSteps = steps.reduce(
                (acc, x) => [[...acc[0], acc[1] + x / sum], acc[1] + x / sum],
                [[0], 0]
            )[0],
            waveAmplitude = amplitude * rand.minmax(...props.amplitude),
            waveOffsets = normSteps.map(
                () => (rand.float() * 2 - 1) * waveAmplitude
            ),
            lineCount = ceil(stack / amplitude),
            x0 = center[0] - len / 2,
            y0 = center[1] - stack / 2

        return [
            ...repeatedly(
                (i) =>
                    normSteps.map((t, idx) =>
                        rotateAround(
                            [
                                x0 + t * len,
                                y0 + (i + 0.5) * amplitude + waveOffsets[idx]
                            ],
                            center,
                            angle
                        )
                    ),
                lineCount
            )
        ]
    }, numLayer)
]


export { buildLineLayer }
