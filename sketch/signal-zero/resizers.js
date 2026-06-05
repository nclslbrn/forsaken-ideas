const {
    sin,
    cos,
    PI,
    abs,
    sqrt,
    floor,
    // ceil,
    atan2,
    // tan,
    min,
    max,
    round,
    hypot
} = Math

export default [
    // 0. Vertical vawes
    ({ y, frame }, { MAX_ROWS, NUM_FRAME }) =>
        abs(sin((frame / NUM_FRAME + y / MAX_ROWS) * 2 * PI)),

    // 1. Ripple from center
    ({ x, y, frame }, { NUM_FRAME, MAX_ROWS, MAX_COLS }) => {
        const centerX = MAX_COLS / 2,
            centerY = MAX_ROWS / 2
        const distance = sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
        const t = (frame / NUM_FRAME) * PI * 2
        // Return a weight between 0 and 1
        return abs((sin(distance * 0.1 - t) + 1) * 0.5)
    },

    // 2. x split wave
    ({ x, frame }, { MAX_COLS, NUM_FRAME }) => {
        const t = sin(
            frame <= NUM_FRAME / 2 ? frame / NUM_FRAME : 1 - frame / NUM_FRAME
        )
        return abs(sin(x * t) / MAX_COLS)
    },

    // 3. Vertical wave
    ({ x, y, frame }, { MAX_ROWS, MAX_COLS, NUM_FRAME }) =>
        abs(
            sin(
                (y / MAX_ROWS + frame / NUM_FRAME) * 2 * PI +
                    (x / MAX_COLS) * PI
            )
        ),

    // 4. XOR pattern
    ({ x, y, frame }, { MAX_COLS, NUM_FRAME }) => {
        const xorValue = (floor(x * 3) ^ floor(y * 3)) % MAX_COLS
        return abs(sin(xorValue + (frame / NUM_FRAME) * 2 * PI))
    },

    // 5. Expanding circles
    ({ x, y, frame }, { MAX_ROWS, MAX_COLS, NUM_FRAME }) => {
        const distance = sqrt((x - MAX_COLS / 2) ** 2 + (y - MAX_ROWS / 2) ** 2)
        return abs(sin(distance * 0.1 - (frame / NUM_FRAME) * 2 * PI))
    },

    // 6. Checkerboard pulse
    ({ x, y, frame }, { NUM_FRAME }) => {
        const t = (frame / NUM_FRAME) * PI * 2
        const checker =
            (floor(x / 4) + floor(y / 3)) % (frame < NUM_FRAME * 0.5 ? 4 : 4)
        return min(max(0.25, abs(checker ? cos(t) : sin(t))), 1.75)
    },

    // 7. Radial breathing
    ({ x, y, frame }, { NUM_FRAME, MAX_COLS, MAX_ROWS }) => {
        const t = (frame / NUM_FRAME) * 2 * PI
        const angle = atan2(y, x)
        const distance = sqrt(x ** 2 + y ** 2)
        const maxDist = sqrt(MAX_COLS ** 2 + MAX_ROWS ** 2)
        return abs((sin(angle * PI + t) + 1) * (1 - distance / maxDist))
    },

    // 8. Perlin-like noise
    ({ x, y, frame }, { NUM_FRAME, MAX_COLS, MAX_ROWS }) => {
        const t = (frame / NUM_FRAME) * 2 * PI
        const noise =
            sin((x / MAX_COLS) * PI) * cos((y / MAX_ROWS) * PI) * sin(t)
        return (noise + 1) * 0.5
    },

    // 9. Spiral
    ({ x, y, frame }, { NUM_FRAME, MAX_COLS, MAX_ROWS }) => {
        const t = (frame / NUM_FRAME) * 2 * PI
        const cx = MAX_COLS / 2,
            cy = MAX_ROWS / 2
        const angle = atan2(y - cy, x - cx)
        const distance = sqrt((x - cx) ** 2 + (y - cy) ** 2)
        return abs(sin(angle * 5 + distance * 0.3 - t))
    },
    // 10. Horizontal scroll
    ({ x, frame }, { MAX_COLS }) => ((x + frame) % MAX_COLS) - MAX_COLS,

    // 11. Vertical scroll
    ({ y, frame }, { MAX_ROWS }) => ((y + frame) % MAX_ROWS) - MAX_ROWS,

    // 12. Corner radiating waves
    ({ x, y, frame }, { NUM_FRAME, MAX_COLS, MAX_ROWS }) => {
        const t = (frame / NUM_FRAME) * 2 * PI
        const d1 = sqrt(x ** 2 + y ** 2)
        const d2 = sqrt((x - MAX_COLS) ** 2 + y ** 2)
        const d3 = sqrt(x ** 2 + (y - MAX_ROWS) ** 2)
        const d4 = sqrt((x - MAX_COLS) ** 2 + (y - MAX_ROWS) ** 2)
        return abs(
            (sin(d1 * 0.3 - t) +
                sin(d2 * 0.3 - t) +
                sin(d3 * 0.3 - t) +
                sin(d4 * 0.3 - t) +
                4) /
                8
        )
    },

    // 13. Interference pattern
    ({ x, y, frame }, { NUM_FRAME, MAX_COLS, MAX_ROWS }) => {
        const t = (frame / NUM_FRAME) * 2 * PI
        return abs(
            (sin((x / MAX_COLS) * 2 * PI + t) *
                sin((y / MAX_ROWS) * 3 * PI + t) +
                1) *
                0.5
        )
    },

    // 14. Target rings
    ({ x, y, frame }, { NUM_FRAME, MAX_COLS, MAX_ROWS }) => {
        const t = (frame / NUM_FRAME) * 2 * PI
        const distance = sqrt((x - MAX_COLS / 2) ** 2 + (y - MAX_ROWS / 2) ** 2)
        return abs(sin(distance * 0.5 - t))
    },

    // 15. Turbulent flow
    ({ x, y, frame }, { NUM_FRAME, MAX_COLS, MAX_ROWS }) => {
        const t = frame / NUM_FRAME //* 2 * PI
        const fx = (x + (frame % MAX_COLS)) % MAX_COLS
        const fy = (y + (frame % MAX_ROWS)) % MAX_ROWS
        const turbulence = cos(fx / MAX_COLS) * sin(fy / MAX_ROWS) // *
        // (cos(fx / MAX_COLS) + sin(fy / MAX_ROWS))
        return abs(sin(turbulence * t))
    },

    // 16. Net
    ({ x, y, frame }, { NUM_FRAME, MAX_COLS, MAX_ROWS }) => {
        const t = (frame / NUM_FRAME) * 2 * PI
        const diamond = abs(x / MAX_COLS) + abs(y / MAX_ROWS)
        return abs(sin(diamond * PI * 2) + Math.cos(t))
    },

    // 17. fold
    ({ x, y, frame }, { NUM_FRAME, MAX_COLS, MAX_ROWS }) => {
        const t = (frame / NUM_FRAME) * 2 * PI
        const cx = MAX_COLS / 2,
            cy = MAX_ROWS / 2
        const angle = atan2(y - cy, x - cx)
        const distance = sqrt((x - cx) ** 2 + (y - cy) ** 2)
        const sectorAngle = abs(angle % (PI / 4)) * 8
        return abs(sin(sectorAngle * 0.5 + distance * 0.01 - t))
    },

    // 18. Sine grid
    ({ x, y, frame }, { NUM_FRAME, MAX_COLS, MAX_ROWS }) => {
        const t = (frame / NUM_FRAME) * 2 * PI
        return abs(
            (sin((x / MAX_COLS) * 2 * PI + t) +
                sin((y / MAX_ROWS) * 2 * PI + t) +
                2) /
                4
        )
    },

    // 19. Wandering hotspot
    ({ x, y, frame }, { NUM_FRAME, MAX_COLS, MAX_ROWS }) => {
        const t = (frame / NUM_FRAME) * 2 * PI
        const hotspotX = MAX_COLS / 2 + (sin(t) * MAX_COLS) / 3
        const hotspotY = MAX_ROWS / 2 + (cos(t) * MAX_ROWS) / 3
        const distance = sqrt((x - hotspotX) ** 2 + (y - hotspotY) ** 2)
        const maxDist = sqrt(MAX_COLS ** 2 + MAX_ROWS ** 2)
        return abs(sin(max(0, 1 - (distance * 2) / maxDist)) * 2 * PI)
    },

    // 20. Horizontal scrolling line
    ({ x, frame }, { NUM_FRAME, MAX_COLS }) => {
        const currCol = round((frame / NUM_FRAME) * MAX_COLS)
        return abs(currCol - x) <= 2
            ? sin(2 - abs(x - currCol))
            : abs(x - currCol) / MAX_COLS
    },

    // 21. Inverse circle wrap
    ({ x, y, frame }, { NUM_FRAME, MAX_COLS, MAX_ROWS }) => {
        const t = ((frame / NUM_FRAME) * 2 - 0.5) * PI * 2
        const cx = MAX_COLS / 2,
            cy = MAX_ROWS / 2,
            dx = (cx - x) / cx,
            dy = (cy - y) / cy
        return abs(sin(t - abs(dx * dy)))
    },

    // 22. Circle wrap
    ({ x, y, frame }, { NUM_FRAME, MAX_COLS, MAX_ROWS }) => {
        const t = (1 - frame / NUM_FRAME) * PI
        const cx = MAX_COLS / 2,
            cy = MAX_ROWS / 2,
            d = hypot((cx - x) / cx, (cy - y) / cy)
        return sin(abs(t - d))
    },

    // 23. Circle wrap ripple
    ({ x, y, frame }, { NUM_FRAME, MAX_COLS, MAX_ROWS }) => {
        //sin(t-sqrt((x-7.5)**2+(y-6)**2))

        const t = frame / NUM_FRAME
        const cx = MAX_COLS / 2,
            cy = MAX_ROWS / 2
        let d = hypot(cx - (x + t), cy - (y + t))

        return abs(sin(t - d))
    },
    // 24 horizontal sliding line
    ({ x, frame }, { NUM_FRAME, MAX_COLS }) => {
        const t = ((frame / NUM_FRAME) * 4) % 1,
            normX = x / MAX_COLS,
            tx = sin((t + normX) % 1)
        return tx > 0.1 && tx < 0.3 ? 0.1 : 0.5
    },
    // 25 bitwise shrink
    ({ x, y, frame }, { NUM_FRAME, MAX_ROWS }) => {
        const t = frame / NUM_FRAME,
            normY = sin((x ^ y) / MAX_ROWS),
            ty = (t + normY * 2) % 1
        return ty < 0.3 ? 0.1 : 0.3
    },
    // 26 another shrink
    ({ x, y, frame }, { NUM_FRAME, MAX_ROWS }) => {
        const t = frame / NUM_FRAME,
            normY = sin((x | y) / MAX_ROWS),
            ty = (t + normY * 2) % 1
        return ty < 0.3 ? 0.1 : 0.3
    },
    // 27 another shrink
    ({ x, y, frame }, { NUM_FRAME, MAX_ROWS }) => {
        const t = frame / NUM_FRAME,
            normY = sin(((x & y) ^ x) / MAX_ROWS),
            ty = sin((t + normY) << t)
        return ty < 0.3 ? 0.1 : 0.3
    },
    // 28 another shrink
    ({ x, y, frame }, { NUM_FRAME, MAX_COLS, MAX_ROWS }) => {
        const t = frame / NUM_FRAME
        return (x + y * MAX_COLS) % MAX_ROWS < t * MAX_COLS ? 0.5 : 0.1
    },
    // 29 Growing circle
    ({ x, y, frame }, { NUM_FRAME, MAX_COLS, MAX_ROWS }) => {
        const t = frame / NUM_FRAME
        const cx = round(MAX_COLS / 2),
            cy = round(MAX_ROWS / 2)
        const maxR = hypot(cx, cy)
        const normR = hypot(x - cx, y - cy) / maxR
        return (normR % 0.2) + (t % 0.2) // > 0.1 ? 0.5 : 0.1
        // return normR < t ? 1 - normR * 0.5 : 0.05
    }
]
