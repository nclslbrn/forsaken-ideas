/* eslint-disable no-case-declarations */
import { polyline, polygon, line } from '@thi.ng/geom'
import { repeatedly } from '@thi.ng/transducers'

const linesBlock = (top, bottom, lineSpacing) => {
    const lines = []
    for (let i = 1; i < Math.min(top.length, bottom.length); i += lineSpacing) {
        if (top[i] && bottom[i]) {
            lines.push(line(top[i], bottom[i]))
        }
    }
    return lines
}
const solidBlock = (top, bottom, secId, colors) => {
    return polygon([...top.reverse(), ...bottom], {
        fill: colors[secId % colors.length]
    })
}

const generatePolygon = (STATE, colors) => {
    const { bands, sections, ground, margin, height, tickPadding } = STATE
    const lines = [],
        polygons = [],
        interbands = [],
        processSection = (dx, top, bottom, sec, i, ground, colors) => {
            const polyTop = [
                ...repeatedly((i) => top[dx + i], sec.len - 1)
            ].filter((v) => v !== undefined)
            const polyBottom = [
                ...repeatedly((i) => bottom[dx + i], sec.len - 1)
            ].filter((v) => v !== undefined)
            let sectionTop = polyTop,
                sectionBottom = polyBottom

            switch (sec.type) {
                case 'lines':
                    lines.push(
                        ...linesBlock(polyTop, polyBottom, sec.lineSpacing)
                    )
                    break
                case 'solid':
                    polygons.push(solidBlock(polyTop, polyBottom.map(v => [v[0], v[1] - ground]), i, colors))
                    polygons.push(solidBlock(polyBottom.map(v => [v[0], v[1] - ground]), polyBottom, i + 1, colors))

                    sectionTop = sectionTop.reverse()
                    break
                case 'splitted-solid':
                    const minY = Math.min(...polyTop.map((v) => v[1]))
                    const maxY = Math.max(...polyBottom.map((v) => v[1]))
                    sectionTop = polyTop.map((v) => [v[0], minY - ground])
                    sectionBottom = polyBottom.map((v) => [v[0], maxY + ground])
                    polygons.push(solidBlock(sectionTop, polyTop, i, colors))
                    polygons.push(
                        solidBlock(polyBottom, sectionBottom, i, colors)
                    )
                    sectionTop = sectionTop.reverse()
                    break
            }
            return [sectionTop, sectionBottom]
        }

    for (let i = 0; i <= bands.length; i++) {
        if (i < bands.length) {
            let [top, bottom] = bands[i]
            const interband = [[], []]

            // sections variations across bands
            if (sections[1] !== undefined) {
                let dx = 0
                sections[i].forEach((sec, j) => {
                    const [sectionTop, sectionBottom] = processSection(
                        dx,
                        top,
                        bottom,
                        sec,
                        j,
                        ground,
                        colors
                    )
                    interband[0].push(...sectionTop)
                    interband[1].push(...sectionBottom)
                    dx += sec.len - 1
                })
            } // same distribution foreach bands
            else {
                let dx = 0
                sections[0].forEach((sec, j) => {
                    const [sectionTop, sectionBottom] = processSection(
                        dx,
                        top,
                        bottom,
                        sec,
                        j,
                        ground,
                        colors
                    )
                    interband[0].push(...sectionTop.map(v => [v[0], v[1] + ground]))
                    interband[1].push(...sectionBottom.map(v => [v[0], v[1] - ground]))
                    dx += sec.len - 1
                })
            }
            interbands.push(interband)

            if (i % 2 === 0) {
                lines.push(polyline(interband[1]))
            } else {
                lines.push(polyline(interband[0]))
            }
            lines.push(
                polyline(
                    top.map((v) => [
                        v[0],
                        v[1] + (i % 2 === 0 ? ground / 2 : ground)
                    ]),
                    { stroke: '#2f2f2f', weight: STATE.dpr * 4 }
                )
            )

            lines.push(
                polyline(
                    bottom.map((v) => [
                        v[0],
                        v[1] - (i % 2 === 0 ? ground / 2 : ground)
                    ]),
                    { stroke: '#2f2f2f', weight: STATE.dpr * 4 }
                )
            )
        }

        const prevBottom =
            i === 0
                ? interbands[i][1].map((v) => [v[0], margin[1]])
                : interbands[i - 1][1]

        const currTop =
            i < interbands.length
                ? interbands[i][0]
                : interbands[i - 1][0].map((v) => [
                    v[0],
                    height - (margin[1] - ground * 2)
                ])

        let dx = 0
        if (sections[1] !== undefined) {
            sections[i].forEach((sec) => {
                const idx = Math.round(dx)
                if (idx < prevBottom.length) {
                    lines.push(
                        line(
                            [prevBottom[idx][0], prevBottom[idx][1] + ground],
                            [currTop[idx][0], currTop[idx][1] - ground],
                            { weight: tickPadding, stroke: '#2f2f2f' }
                        )
                    )
                    dx += sec.len - 1
                }
            })
        } else {
            sections[0].forEach((sec) => {
                const idx = Math.round(dx + sec.len / 2)
                if (idx < prevBottom.length) {
                    lines.push(
                        line(
                            [prevBottom[idx][0], prevBottom[idx][1] + ground],
                            [currTop[idx][0], currTop[idx][1] - ground],
                            { weight: tickPadding, stroke: '#2f2f2f' }
                        )
                    )
                    dx += sec.len - 1
                }
            })
        }
        /*
        for (
            let k = 0;
            k < Math.min(prevBottom.length, currTop.length);
            k += tickSpacing
        ) {

            lines.push(
                line(
                    [prevBottom[k][0], prevBottom[k][1] + ground],
                    [currTop[k][0], currTop[k][1] - ground]
                )
            )
        }
        */
    }
    return [polygons, lines]
}

export { generatePolygon }
