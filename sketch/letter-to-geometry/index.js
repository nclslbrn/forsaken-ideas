import '../full-canvas.css'
import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { getGlyphVector } from '@nclslbrn/plot-writer'

const T = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'] // An array of possible char used in the composition
const d = 0.025
const extruderPoints = [
    [-d, -d],
    [d, -d],
    [d, d],
    [-d, d]
]
const extrudesShape = new THREE.Shape()
extrudesShape.moveTo(...extruderPoints[0], 0)
extruderPoints.forEach((pt) => extrudesShape.lineTo(...pt, 0))

const windowFrame = document.getElementById('windowFrame')

const glyphGeom = (letter, size) => {
    const glyph = getGlyphVector(letter, size, [-size[0] / 2, -size[1] / 2])
    const closedSplines = glyph.map((l) => {
        const unloop = l[0] === l[l.length - 1] ? l.slice(0, -1) : [...l]
        const spline = new THREE.CatmullRomCurve3([
            ...unloop.map((p) => new THREE.Vector3(...p, 0))
        ])
        if (l[0] === l[l.length - 1]) {
            spline.closed = true
        } else {
            spline.closed = false
        }
        spline.curveType = 'catmullrom'
        spline.tension = 0
        return spline
    })

    return closedSplines.map((spl) => {
        const extrusion = {
            steps: spl.arcLengthDivisions,
            bevelEnabled: false,
            extrudePath: spl
        }
        return new THREE.ExtrudeGeometry(extrudesShape, extrusion)
    })
}

class App {
    constructor() {
        this.initScene()
        this.initStats()
        this.initListeners()
    }

    initStats() {
        this.stats = new Stats()
        windowFrame.appendChild(this.stats.dom)
        this.stats.dom.style.top = 'auto'
        this.stats.dom.style.left = 'auto'
        this.stats.dom.style.right = '0'
        this.stats.dom.style.bottom = '0'
    }

    createGlyph(letter, pos, rx, ry) {
        const glyphGeometry = glyphGeom(letter, [0.4, 1])
        glyphGeometry.map((geom) => {
            const m = new THREE.Mesh(geom, this.glyphMat)
            m.position.x = pos[0]
            m.position.y = pos[1]
            m.position.z = pos[2] + 0.25
            m.rotation.y = ry
            m.rotation.x = rx
            m.castShadow = true
            m.receiveShadow = true
            this.scene.add(m)
            this.glyphs.add(m)
        })
    }

    initScene() {
        this.scene = new THREE.Scene()
        this.glyphMat = new THREE.MeshLambertMaterial({ color: 0xffffff })
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            20
        )
        this.camera.position.y = -4
        this.camera.position.z = 2
        this.camera.lookAt(this.scene.position)

        this.renderer = new THREE.WebGLRenderer()
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth, window.innerHeight)

        windowFrame.appendChild(this.renderer.domElement)
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.lightAmbient = new THREE.AmbientLight(0x222222)
        this.scene.add(this.lightAmbient)

        // Add a point light to add shadows
        // https://github.com/mrdoob/three.js/pull/14087#issuecomment-431003830
        const shadowIntensity = 1

        this.lightPoint = new THREE.PointLight(0xffffff)
        this.lightPoint.position.set(0, 0, 3)
        this.lightPoint.castShadow = true
        this.lightPoint.intensity = shadowIntensity
        this.scene.add(this.lightPoint)

        const lightPoint2 = this.lightPoint.clone()
        lightPoint2.intensity = 1 - shadowIntensity
        lightPoint2.castShadow = true
        this.scene.add(lightPoint2)

        const mapSize = 1024 // Default 512
        const cameraNear = 0.5 // Default 0.5
        const cameraFar = 500 // Default 500
        this.lightPoint.shadow.mapSize.width = mapSize
        this.lightPoint.shadow.mapSize.height = mapSize
        this.lightPoint.shadow.camera.near = cameraNear
        this.lightPoint.shadow.camera.far = cameraFar

        this.glyphs = new THREE.Group()
        for (let z = 0; z <= 2; z++) {
            for (let y = -2; y <= 2; y++) {
                for (let x = -2; x <= 2; x++) {
                    this.createGlyph(
                        T[Math.ceil(Math.random() * T.length)],
                        [x * 0.35, y * 0.5, z * 0.5],
                        -Math.PI / 2,
                        (x + z) % 2 === 0 ? Math.PI / 4 : -Math.PI / 4
                    )
                    this.createGlyph(
                        T[Math.ceil(Math.random() * T.length)],
                        [x * 0.35, y * 0.5, z * 0.5],
                        0,
                        0
                    )
                }
            }
        }
        this.glyphs.position.z = 0
        this.scene.add(this.glyphs)

        // Add a plane
        const geometryPlane = new THREE.PlaneGeometry(
            window.innerWidth / 60,
            window.innerHeight / 60,
            1,
            1
        )
        const materialPlane = new THREE.MeshPhongMaterial({ color: 0xcccccc })

        this.plane = new THREE.Mesh(geometryPlane, materialPlane)
        this.plane.position.z = 0
        this.plane.receiveShadow = true
        this.scene.add(this.plane)

        // Init animation
        this.animate()
    }

    initListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this), false)
        window.addEventListener('keydown', (event) => {
            const { key } = event
            switch (key) {
                case 'e':
                    const win = window.open('', 'Canvas Image')
                    const { domElement } = this.renderer
                    // Makse sure scene is rendered.
                    this.renderer.render(this.scene, this.camera)
                    const src = domElement.toDataURL()
                    if (!win) return
                    win.document.write(
                        `<img src='${src}' width='${domElement.width}' height='${domElement.height}'>`
                    )
                    break
                default:
                    break
            }
        })
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
    }

    animate() {
        requestAnimationFrame(() => {
            this.animate()
        })
        this.glyphs.rotation.z += 0.005

        if (this.stats) this.stats.update()
        if (this.controls) this.controls.update()
        this.renderer.render(this.scene, this.camera)
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new App()
})
