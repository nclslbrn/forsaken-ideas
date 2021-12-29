const arc = (props) => {
    const res = 0.005
    const radius = Math.sqrt(Math.pow(props.w, 2) + Math.pow(props.h, 2))
    const circleDef = [
        {
            // top left corner
            center: { x: props.x, y: props.y },
            angle: { start: 0, end: Math.PI * 0.5 }
        },
        {
            // top right corner
            center: { x: props.x + props.w, y: props.y },
            angle: { start: Math.PI * 0.5, end: Math.PI }
        },
        {
            // bottom right corner
            center: { x: props.x + props.w, y: props.y + props.h },
            angle: { start: Math.PI, end: Math.PI * 1.5 }
        },
        {
            // bottom left corner
            center: { x: props.x, y: props.y + props.h },
            angle: { start: Math.PI * 1.5, end: Math.PI * 2 }
        }
    ]
    const rotation = circleDef[Math.floor(Math.random() * circleDef.length)]
    const lines = []
    for (let r = props.step; r <= radius; r += props.step) {
        const arc = []
        for (
            let theta = rotation.angle.start;
            theta <= rotation.angle.end;
            theta += res
        ) {
            const point = [
                rotation.center.x + r * Math.cos(theta),
                rotation.center.y + r * Math.sin(theta)
            ]

            if (
                point[0] > props.x &&
                point[0] < props.x + props.w &&
                point[1] > props.y &&
                point[1] < props.y + props.h
            ) {
                arc.push(point)
            }
        }
        if (arc.length > 0) lines.push(arc)
    }
    return lines
}

/////////////////////////////////////////////////////////////////////////////////
const corner = (props) => {
    const radius = Math.max(props.w, props.h)
    const axe = Math.floor(Math.random() * 4)
    const corner = []
    for (let d = 0; d < radius; d += props.step) {
        let lines = []
        if (axe === 0) {
            // top left corner
            lines = [
                [props.x + d, props.y],
                [props.x + d, props.y + d],
                [props.x, props.y + d]
            ]
        }
        if (axe === 1) {
            // top right corner
            lines = [
                [props.x + d, props.y],
                [props.x + d, props.y + props.h - d],
                [props.x + props.w, props.y + props.h - d]
            ]
        }
        if (axe === 2) {
            // bottom right corner
            lines = [
                [props.x + d, props.y + props.h],
                [props.x + d, props.y + d],
                [props.x + props.w, props.y + d]
            ]
        }
        if (axe === 3) {
            // bottom left corner
            lines = [
                [props.x + d, props.y],
                [props.x + d, props.y + props.h - d],
                [props.x + props.w, props.y + props.h - d]
            ]
        }

        lines.forEach((l, i, lines) => {
            lines[i][0] = Math.max(props.x, l[0])
            lines[i][0] = Math.min(l[0], props.x + props.w)
            lines[i][1] = Math.max(props.y, l[1])
            lines[i][1] = Math.min(l[1], props.y + props.h)
        })
        corner.push(lines)
    }

    return corner
}

/////////////////////////////////////////////////////////////////////////////////
const line = (props) => {
    const lines = []
    if (Math.random() > 0.5) {
        for (let y = 0; y <= props.h; y += props.step) {
            lines.push([
                [props.x, props.y + y],
                [props.x + props.w, props.y + y]
            ])
        }
    } else {
        for (let x = 0; x <= props.w; x += props.step) {
            lines.push([
                [props.x + x, props.y],
                [props.x + x, props.y + props.h]
            ])
        }
    }
    return lines
}
/////////////////////////////////////////////////////////////////////////////////
export default function hatch(props) {
    const fill = [arc, corner, line]
    return fill[Math.floor(Math.random() * fill.length)](props)
}
