let canvas = null

const sketch = p5 => {
    let roads = []
    const roadNum = 64
    const numFrames = 126
    const initRoad = () => {
        return {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerWidth,
            direction: Math.round(Math.random() * 4),
            size: Math.random() * window.innerWidth,
            particeSize: Math.random() * 5,
            delay: 156 + Math.random() * 156
        }
    }
    const position = (road, distance) => {
        let x = road.x
        let y = road.y

        switch (road.direction) {
            case 1:
                x = road.x + distance
                break

            case 2:
                x = road.x - distance
                break

            case 3:
                y = road.y + distance
                break

            case 4:
                y = road.y - distance
                break
        }
        return { x: x, y: y }
    }

    sketch.init = () => {
        roads = []
        for (let i = 0; i < roadNum; i++) {
            roads.push(initRoad())
        }
        p5.background(0)
    }

    p5.setup = () => {
        p5.setAttributes('preserveDrawingBuffer', true)
        canvas = p5.createCanvas(window.innerWidth, window.innerWidth, p5.WEBGL)
        p5.smooth()
        p5.noStroke()
        p5.fill(175)
        init()
    }

    p5.draw = () => {
        const t =
            (1.0 *
                (p5.frameCount < numFrames
                    ? p5.frameCount
                    : p5.frameCount % numFrames)) /
            numFrames

        p5.push()
        p5.rotateX(p5.PI / 3.5)
        p5.translate(-window.innerWidth / 2, -window.innerHeight * 3.5)

        for (let i = 0; i < roadNum; i++) {
            if (roads[i] != undefined) {
                const distance = p5.map(t, 0, 1, 0, roads[i].size)
                const currentPos = position(roads[i], distance)

                p5.ellipse(currentPos.x, currentPos.y, roads[i].particeSize)

                if (t > 0.99) {
                    roads[i] = initRoad()
                    roads[i].x = currentPos.x
                    roads[i].y = currentPos.y
                }
            }
        }
        p5.pop()
    }

    sketch.exportPNG = () => {
        const date = new Date()
        const filename =
            'Moving-light.' +
            date.getFullYear() +
            '-' +
            date.getMonth() +
            '-' +
            date.getDay() +
            '_' +
            date.getHours() +
            '.' +
            date.getMinutes() +
            '.' +
            date.getSeconds() +
            '--copyright_Nicolas_Lebrun_CC-by-3.0'
        p5.save(canvas, filename, 'png')
    }
}
export default sketch