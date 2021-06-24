import * as THREE from 'three'
import SVGRenderer from './renderer/SVGRenderer'
import Projector from './renderer/Projector'
import remap from './remap'
import SimplexNoise from 'simplex-noise'
import Fbm from './Fbm'
const simplex = new SimplexNoise(Math.random() * 99999)

Projector()
SVGRenderer()

const sketch = {
    size: { w: 1587.40157, h: 1122.51969 },
    elevation: [], // store points positions at t
    xLines: [], // store every points pos
    yLines: [],
    stepSize: 16,
    camera: new THREE.PerspectiveCamera(
        90,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    ),
    scene: new THREE.Scene(),
    renderer: new THREE.SVGRenderer(),
    fbm: new Fbm({
        frequency: 512,
        octaves: 4,
        amplitude: 20,
        seed: 'seed'
    }),
    launch: () => {
        sketch.camera.position.z = 0.8
        sketch.scene.background = new THREE.Color(255, 255, 255)
        sketch.renderer.setSize(sketch.size.w, sketch.size.h)
        document
            .getElementById('windowFrame')
            .appendChild(sketch.renderer.domElement)

        sketch.init()
    },
    init: () => {
        sketch.elevation = []
        sketch.xLines = []
        sketch.yLines = []

        for (let y = 0; y < sketch.size.h; y += sketch.stepSize) {
            sketch.elevation[y] = []
            for (let x = 0; x < sketch.size.w; x += sketch.stepSize) {
                const noise = sketch.fbm.f(
                    x / sketch.size.w,
                    y / sketch.size.h,
                    simplex.noise2D(x, y)
                )

                sketch.elevation[y][x] = noise
            }
            sketch.yLines.push([])
        }
        for (let x = 0; x < sketch.size.w; x += sketch.stepSize) {
            sketch.xLines.push([])
        }
        console.log('Sketch initialized')
        console.log('Noise seed', sketch.fbm.seed)
        sketch.update()
    },
    getProjectedPoint: (x, y) => {
        // get terrain elevation
        const z = sketch.elevation[y][x]
        // create a coordinate
        return [
            x / sketch.size.w - 0.5,
            y / sketch.size.h - 0.5,
            z / sketch.size.h
        ]
    },
    update: () => {
        for (let y = 0; y < sketch.size.h; y += sketch.stepSize) {
            const yLine = []
            for (let x = 0; x < sketch.size.w; x += sketch.stepSize) {
                yLine.push(sketch.getProjectedPoint(x, y))
            }
            sketch.yLines.push(yLine)
        }
        for (let x = 0; x < sketch.size.w; x += sketch.stepSize) {
            const xLine = []
            for (let y = 0; y < sketch.size.h; y += sketch.stepSize) {
                xLine.push(sketch.getProjectedPoint(x, y))
            }
            sketch.xLines.push(xLine)
        }
        sketch.draw()
    },

    draw: () => {
        const group = new THREE.Group()
        const lines = [...sketch.xLines, ...sketch.yLines]
        const material = new THREE.LineBasicMaterial({
            color: 0x000000,
            linewidth: 1
        })
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].length > 1) {
                const geometry = new THREE.BufferGeometry()
                const vertices = [].concat(...lines[i])
                geometry.setAttribute(
                    'position',
                    new THREE.Float32BufferAttribute(vertices, 3)
                )
                const threeLine = new THREE.Line(geometry, material)
                group.add(threeLine)
            }
            group.rotateOnWorldAxis(
                new THREE.Vector3(1, 0, 0),
                THREE.Math.degToRad(12)
            )
            //group.position.set(-sketch.size.w / 2, -sketch.size.h / 2, 0)
            sketch.scene.add(group)
        }
        sketch.renderer.render(sketch.scene, sketch.camera)
        // requestAnimationFrame(sketch.update)
    },
    export: () => {
        const date = new Date(),
            Y = date.getFullYear(),
            m = date.getMonth(),
            d = date.getDay(),
            H = date.getHours(),
            i = date.getMinutes(),
            filename = `noise-landscape.${Y}-${m}-${d}_${H}.${i}.svg`,
            content = new Blob(
                [document.getElementById('windowFrame').innerHTML],
                {
                    type: 'text/plain'
                }
            )

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
