let canvas = null

const sketch = (p5) => {
    let roads = []
    const roadNum = 256
    const numFrames = 40
    const initRoad = (x = false, y = false) => {
        return {
            x: x ? x : p5.random(p5.width) - p5.width / 2,
            y: y ? y : p5.random(p5.height) - p5.width / 2,
            direction: Math.floor(Math.random() * 4) + 1,
            size: Math.random() * (p5.width / 8),
            particeSize: Math.random() * 4 + 0.5
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

    p5.setup = () => {
        p5.setAttributes('preserveDrawingBuffer', true)
        canvas = p5.createCanvas(
            window.innerWidth * 2,
            window.innerHeight * 2,
            p5.WEBGL
        )
        //p5.background(0)
        p5.smooth()
        p5.noStroke()
        p5.fill(175)
        init()
    }

    p5.draw = () => {
        const t = 1 * ((p5.frameCount % numFrames) / numFrames)
        const offRoads = []
        const newRoads = []
        p5.push()
        p5.translate(0, (p5.width - p5.height) / 2)
        p5.rotateX(p5.PI / 3.5)

        for (let i = 0; i < roads.length; i++) {
            if (roads[i] != undefined) {
                const distance = p5.map(t, 0, 1, 0, roads[i].size)
                const currentPos = position(roads[i], distance)

                p5.ellipse(currentPos.x, currentPos.y, roads[i].particeSize)

                if (
                    currentPos.x < -p5.width * 0.5 ||
                    currentPos.x > p5.width * 0.5 ||
                    currentPos.y < p5.heigth * 0.25 ||
                    currentPos.y > p5.heigth * 1.5
                ) {
                    offRoads.push(i)
                }
                if (p5.frameCount % numFrames == 0) {
                    roads[i] = initRoad(currentPos.x, currentPos.y)
                    if (roads.length < roadNum) {
                        newRoads.push([roads[i].x, roads[i].y])
                        newRoads.push([currentPos.x, currentPos.y])
                    }
                }
            }
        }
        p5.pop()
        for (let i = 0; i < offRoads.length; i++) {
            roads.splice(offRoads[i], 1)
        }
        if (roads.length > roadNum) {
            for (let j = 0; j < newRoads.length; j++) {
                if (roads.length + j > roadNum) {
                    roads.push(initRoad(newRoads[j][0], newRoads[j][1]))
                }
            }
        }
    }

    p5.windowResized = () => {
        p5.resizeCanvas(window.innerWidth, window.innerHeight)
        init()
    }

    sketch.init = () => {
        roads = []
        for (let i = 0; i < 126; i++) {
            roads.push(initRoad())
        }
        p5.background(0)
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
        p5.saveFrames(filename, 'jpg', 1, 1)
    }
}
export default sketch
