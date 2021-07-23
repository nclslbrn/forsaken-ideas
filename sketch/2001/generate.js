import Fbm from './Fbm'

const generateHeight = (width, height, seed) => {
    const size = width * height,
        data = new Uint8Array(size),
        fbm = new Fbm({
            frequency: 0.03,
            octaves: 7,
            amplitude: 0.15,
            seed: seed
        }),
        z = Math.random() * 100

    let quality = 1
    const middle = { x: width / 2, y: height / 2 }
    const buildNum = 64
    const maxBuildSize = { w: 4, h: 4 }
    const builds = Array.from(new Array(buildNum), (a, b) => {
        return {
            x: Math.floor(width / 2 + (Math.random() / 4 - 0.125) * width), // x pos
            y: Math.floor(height / 2 + (Math.random() / 4 - 0.125) * height), // y pos
            w: Math.ceil(Math.random() * maxBuildSize.w), // width
            h: Math.ceil(Math.random() * maxBuildSize.h), // height
            d: Math.random() // depth
        }
    })
    builds.push({
        ...middle,
        w: Math.ceil(Math.random() * maxBuildSize.w),
        h: Math.ceil(Math.random() * maxBuildSize.h),
        d: Math.random()
    })

    // first generate terrain
    for (let j = 0; j < 6; j++) {
        for (let i = 0; i < size; i++) {
            const x = i % width,
                y = ~~i / width

            data[i] += Math.abs(
                fbm.f(x / quality, y / quality, z) * quality * 2
            )
        }
        quality *= 3
    }

    // get the highest point
    const highestPoint = data.reduce((accumulator, currentValue) =>
        Math.max(accumulator, currentValue)
    )
    const lowestPoint = data.reduce((accumulator, currentValue) =>
        Math.min(accumulator, currentValue)
    )

    // add buildings
    for (let i = 0; i < size; i++) {
        const x = i % width,
            y = ~~i / width

        for (let h = 0; h < builds.length; h++) {
            if (
                Math.abs(builds[h].x - x) <= builds[h].w &&
                Math.abs(builds[h].y - y) <= builds[h].h
            ) {
                data[i] =
                    (highestPoint - lowestPoint) * builds[h].d + lowestPoint
            }
        }
    }
    return data
}

export { generateHeight }
