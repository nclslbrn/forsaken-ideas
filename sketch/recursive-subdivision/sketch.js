import * as THREE from 'three'
import { SVGRenderer } from 'three/examples/jsm/renderers/SVGRenderer'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter'

const randomBetween = (interval = { min: 0, max: 1 }) => {
    return interval.min + Math.random() * (interval.max - interval.min)
}
const sketch = {
    // Main sketch variables
    size: { w: 1587.40157, h: 1122.51969 },
    thickness: 0.05,
    decrease: 0.7,
    expectedDivisions: 12,
    subSize: { min: 0.3, max: 0.7 },
    divisions: [],
    camera: new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.001,
        200
    ),
    scene: new THREE.Scene(),
    renderer: new SVGRenderer({ overdraw: 2 }),
    faceMat: new THREE.MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.5,
        transparent: true
    }),
    edgeMat: new THREE.LineBasicMaterial({
        color: 0x000000
    }),
    controls: false,
    exporter: new OBJExporter(),
    /**
     * Run once after page load (similar to processing setup())
     */
    launch: () => {
        sketch.camera.position.z = sketch.expectedDivisions
        sketch.scene.background = new THREE.Color(255, 255, 255)
        sketch.renderer.setSize(sketch.size.w, sketch.size.h)
        document
            .getElementById('windowFrame')
            .appendChild(sketch.renderer.domElement)

        // sketch.renderer.domElement.style = 'max-width: 95vh; height: auto;'
        sketch.controls = new OrbitControls(
            sketch.camera,
            sketch.renderer.domElement
        )
        sketch.controls.screenSpacePanning = true

        sketch.init()
    },
    /**
     * Used before first update or when user reset the sketch
     */
    init: () => {
        sketch.clean()

        // Replace previous divisions with a full size rectangle
        sketch.divisions = [
            {
                w: 4,
                h: 4,
                x: 0,
                y: 0,
                pos: 0
            }
        ]
        // on click subdivide
        // document.addEventListener('keydown', sketch.update, false)

        sketch.update()
        sketch.render()
    },

    /**
     * Main division computation
     * @typedef {division} props defines next possible division
     *  @property w: width
     *  @property h: height:
     *  @property x: top left x position
     *  @property y: top left y position,
     *  @property chance: probability between 0 and 1 to split,
     *  @property isVert: boolean define vertical or horizontal split
     *  @property pos: total split to create this shape
     */
    subdivision: (props) => {
        if (props) {
            const { w, h, x, y, chance, isVert, pos } = props
            if (chance > Math.random()) {
                if (isVert) {
                    const nW = randomBetween(sketch.subSize).toPrecision(4) * w
                    sketch.subdivision({
                        w: nW,
                        h: h,
                        x: x - (w - nW) / 2,
                        y: y,
                        chance: chance * sketch.decrease,
                        isVert: false,
                        pos: pos + 1
                    })
                    sketch.subdivision({
                        w: w - nW,
                        h: h,
                        x: x + nW / 2,
                        y: y,
                        chance: chance * sketch.decrease,
                        isVert: false,
                        pos: pos + 1
                    })
                } else {
                    const nH = randomBetween(sketch.subSize).toPrecision(4) * h
                    sketch.subdivision({
                        w: w,
                        h: nH,
                        x: x,
                        y: y - (h - nH) / 2,
                        chance: chance * sketch.decrease,
                        isVert: true,
                        pos: pos + 1
                    })
                    sketch.subdivision({
                        w: w,
                        h: h - nH,
                        x: x,
                        y: y + nH / 2,
                        chance: chance * sketch.decrease,
                        isVert: true,
                        pos: pos + 1
                    })
                }
            } else {
                const newDivision = {
                    x: x, //+ sketch.thickness * 0.5,
                    y: y, //+ sketch.thickness * 0.5,
                    w: w - sketch.thickness,
                    h: h - sketch.thickness,
                    pos: pos
                }
                sketch.divisions.push(newDivision)
            }
        }
    },
    clean: () => {
        sketch.scene.children.forEach((child) => {
            // console.log(child)
            sketch.scene.remove(child)
        })
    },
    /**
     * Function to iterate over a new subdivision
     */
    update: () => {
        const randDivisionIndex = Math.floor(
            Math.random() * sketch.divisions.length
        )
        let nextDivisionProps = { ...sketch.divisions[randDivisionIndex] }

        nextDivisionProps.chance = Math.random()
        nextDivisionProps.isVert = Math.random() < 0.5

        sketch.divisions.splice(randDivisionIndex, 1)
        sketch.subdivision(nextDivisionProps)
        sketch.draw()

        if (sketch.divisions.length < sketch.expectedDivisions) {
            requestAnimationFrame(sketch.update)
        } else {
            console.log('We got ', sketch.divisions.length, ' divisions')
            //sketch.notify('Done')
        }
    },
    /**
     * Put element in the window (kind of processing draw())
     */
    draw: () => {
        // remove previously created cubes
        sketch.clean()

        const depth = 0.2
        for (let i = 0; i < sketch.divisions.length; i++) {
            const geometry = new THREE.BoxGeometry(
                sketch.divisions[i].w,
                sketch.divisions[i].h,
                depth
            )

            const cube = new THREE.Mesh(geometry, sketch.faceMat)
            cube.position.set(sketch.divisions[i].x, sketch.divisions[i].y, 0)
            sketch.scene.add(cube)

            const edgesGeometry = new THREE.EdgesGeometry(geometry)
            const wireframe = new THREE.LineSegments(
                edgesGeometry,
                sketch.edgeMat
            )
            wireframe.position.set(
                sketch.divisions[i].x,
                sketch.divisions[i].y,
                0
            )
            sketch.scene.add(wireframe)
        }

        sketch.renderer.render(sketch.scene, sketch.camera)
    },

    render: () => {
        requestAnimationFrame(sketch.render)
        sketch.renderer.render(sketch.scene, sketch.camera)
    },

    /**
     * Fancy notification
     */
    notify: (message) => {
        const p = document.createElement('p')
        p.setAttribute('style', 'padding: 1em;')
        p.innerHTML = message
        document.getElementById('windowFrame').appendChild(p)
        console.log(message)
        window.setTimeout(() => {
            document.getElementById('windowFrame').removeChild(p)
        }, 5000)
    },
    /**
     * Function to download the svg as file
     */
    export: () => {
        const data = sketch.exporter.parse(sketch.scene)
        const date = new Date(),
            Y = date.getFullYear(),
            m = date.getMonth(),
            d = date.getDay(),
            H = date.getHours(),
            i = date.getMinutes(),
            filename = `recursive-division.${Y}-${m}-${d}_${H}.${i}.obj`,
            content = new Blob([data], {
                type: 'text/plain'
            })

        let svgFile = null
        if (svgFile !== null) {
            window.URL.revokeObjectURL(svgFile)
        }
        svgFile = window.URL.createObjectURL(content)

        const link = document.createElement('a')
        link.href = svgFile
        link.download = filename
        link.click()
    }
}

export { sketch }
