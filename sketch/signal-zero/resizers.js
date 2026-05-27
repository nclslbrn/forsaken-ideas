const { sin, cos, PI, abs, sqrt, floor, atan2, max, round, hypot } = Math

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

    // 4. Diagonal scroll
    ({ x, y, frame }, { MAX_COLS, MAX_ROWS, NUM_FRAME }) =>
        abs(
            sin(x / MAX_COLS + y / MAX_ROWS - sin((frame / NUM_FRAME) * 2 * PI))
        ),

    // 5. XOR pattern
    ({ x, y, frame }, { MAX_COLS, NUM_FRAME }) => {
        const xorValue = (floor(x * 3) ^ floor(y * 3)) % MAX_COLS
        return abs(sin(xorValue + (frame / NUM_FRAME) * 2 * PI))
    },

    // 6. Expanding circles
    ({ x, y, frame }, { MAX_ROWS, MAX_COLS, NUM_FRAME }) => {
        const distance = sqrt((x - MAX_COLS / 2) ** 2 + (y - MAX_ROWS / 2) ** 2)
        return abs(sin(distance * 0.1 - (frame / NUM_FRAME) * 2 * PI))
    },

    // 7. Checkerboard pulse
    ({ x, y, frame }, { NUM_FRAME }) => {
        const t = (frame / NUM_FRAME) * 2 * PI
        const checker = (floor(x / 5) + floor(y / 3)) % 2
        return checker ? abs(sin(t)) : abs(cos(t))
    },

    // 8. Radial breathing
    ({ x, y, frame }, { NUM_FRAME, MAX_COLS, MAX_ROWS }) => {
        const t = (frame / NUM_FRAME) * 2 * PI
        const angle = atan2(y, x)
        const distance = sqrt(x ** 2 + y ** 2)
        const maxDist = sqrt(MAX_COLS ** 2 + MAX_ROWS ** 2)
        return abs((sin(angle * PI + t) + 1) * (1 - distance / maxDist))
    },

    // 9. Perlin-like noise
    ({ x, y, frame }, { NUM_FRAME, MAX_COLS, MAX_ROWS }) => {
        const t = (frame / NUM_FRAME) * 2 * PI
        const noise =
            sin((x / MAX_COLS) * PI) * cos((y / MAX_ROWS) * PI) * sin(t)
        return (noise + 1) * 0.5
    },

    // 10. Spiral
    ({ x, y, frame }, { NUM_FRAME, MAX_COLS, MAX_ROWS }) => {
        const t = (frame / NUM_FRAME) * 2 * PI
        const cx = MAX_COLS / 2,
            cy = MAX_ROWS / 2
        const angle = atan2(y - cy, x - cx)
        const distance = sqrt((x - cx) ** 2 + (y - cy) ** 2)
        return abs(sin(angle * 5 + distance * 0.3 - t))
    },
    // 11. Horizontal scroll
    ({ x, frame }, { MAX_COLS }) => ((x + frame) % MAX_COLS) - MAX_COLS,

    // 12. Vertical scroll
    ({ y, frame }, { MAX_ROWS }) => ((y + frame) % MAX_ROWS) - MAX_ROWS,

    // 13. Corner radiating waves
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

    // 14. Interference pattern
    ({ x, y, frame }, { NUM_FRAME, MAX_COLS, MAX_ROWS }) => {
        const t = (frame / NUM_FRAME) * 2 * PI
        return abs(
            (sin((x / MAX_COLS) * 2 * PI + t) *
                sin((y / MAX_ROWS) * 3 * PI + t) +
                1) *
                0.5
        )
    },

    // 15. Target rings
    ({ x, y, frame }, { NUM_FRAME, MAX_COLS, MAX_ROWS }) => {
        const t = (frame / NUM_FRAME) * 2 * PI
        const distance = sqrt((x - MAX_COLS / 2) ** 2 + (y - MAX_ROWS / 2) ** 2)
        return abs(sin(distance * 0.5 - t))
    },

    // 16. Turbulent flow
    ({ x, y, frame }, { NUM_FRAME, MAX_COLS, MAX_ROWS }) => {
        const ff =
            (frame < NUM_FRAME * 0.5
                ? frame / NUM_FRAME
                : 1 - frame / NUM_FRAME) *
            PI *
            4
        const turbulence =
            sin((x / (MAX_COLS * 0.5)) * ff) *
            cos((y / (MAX_ROWS * 0.5)) * ff) *
            sin(x / (MAX_COLS * 0.5) + (y / (MAX_ROWS * 0.5)) * ff)
        return abs(sin(turbulence + 1) * ff)
    },

    // 17. Diamond pattern
    ({ x, y, frame }, { NUM_FRAME, MAX_COLS, MAX_ROWS }) => {
        const t = (frame / NUM_FRAME) * 2 * PI
        const diamond = abs(x / MAX_COLS) + abs(y / MAX_ROWS)
        return abs(sin(diamond * PI * 3 - t) * 2 * PI)
    },

    // 18. Kaleidoscope
    ({ x, y, frame }, { NUM_FRAME, MAX_COLS, MAX_ROWS }) => {
        const t = (frame / NUM_FRAME) * 2 * PI
        const cx = MAX_COLS / 2,
            cy = MAX_ROWS / 2
        const angle = atan2(y - cy, x - cx)
        const distance = sqrt((x - cx) ** 2 + (y - cy) ** 2)
        const sectorAngle = abs(angle % (PI / 4)) * 8
        return abs(sin(sectorAngle * 0.01 + distance - t))
    },

    // 19. Sine grid
    ({ x, y, frame }, { NUM_FRAME, MAX_COLS, MAX_ROWS }) => {
        const t = (frame / NUM_FRAME) * 2 * PI
        return abs(
            (sin((x / MAX_COLS) * 2 * PI + t) +
                sin((y / MAX_ROWS) * 2 * PI + t) +
                2) /
                4
        )
    },

    // 20. Wandering hotspot
    ({ x, y, frame }, { NUM_FRAME, MAX_COLS, MAX_ROWS }) => {
        const t = (frame / NUM_FRAME) * 2 * PI
        const hotspotX = MAX_COLS / 2 + (sin(t) * MAX_COLS) / 3
        const hotspotY = MAX_ROWS / 2 + (cos(t) * MAX_ROWS) / 3
        const distance = sqrt((x - hotspotX) ** 2 + (y - hotspotY) ** 2)
        const maxDist = sqrt(MAX_COLS ** 2 + MAX_ROWS ** 2)
        return abs(sin(max(0, 1 - (distance * 2) / maxDist)) * 2 * PI)
    },

    // 21. Horizontal scrolling line
    ({ x, y, frame }, { NUM_FRAME, MAX_COLS }) => {
        const currCol = round((frame / NUM_FRAME) * MAX_COLS)
        return abs(currCol - x) <= 2
            ? sin(2 - abs(x - currCol))
            : abs(x - currCol) / MAX_COLS
    },

    // 22. Circle wrap
    ({ x, y, frame }, { NUM_FRAME, MAX_COLS, MAX_ROWS }) => {
        //sin(t-sqrt((x-7.5)**2+(y-6)**2))
        const t = ((frame / NUM_FRAME) * 2 - 0.5) * PI * 2
        const cx = MAX_COLS / 2,
            cy = MAX_ROWS / 2,
            dx = (cx - x) / cx,
            dy = (cy - y) / cy
        return abs(sin(t - abs(dx * dy)))
    }
]
