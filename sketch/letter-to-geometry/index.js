import '../full-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { getGlyphVector } from '@nclslbrn/plot-writer'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'

// An array of possible char used in the composition
const T = [...'₠₡₢₣₤₥₦₧₩₪₫€₭₮₯₰₱₲₳₴₵₶₷₸₹₺₻₼₽₾₿₨$£¤¥']
const d = 0.02
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
            steps: spl.arcLengthDivisions / 10,
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
        this.stats.dom.style.left = 'auto'
        this.stats.dom.style.right = '0'
        this.stats.dom.style.pointerEvent = 'none'
    }

    createGlyph(letter, pos, rx, ry) {
        const glyphGeometry = glyphGeom(letter, [0.5, 0.85])
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
        this.clock = new THREE.Clock()
        this.glyphMat = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            emissive: 0x222233
        })
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            20
        )
        this.camera.position.y = -3
        this.camera.position.z = 5
        this.camera.lookAt(this.scene.position)

        this.renderer = new THREE.WebGLRenderer()
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth, window.innerHeight)

        const renderScene = new RenderPass(this.scene, this.camera)

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5,
            0.4,
            0.5
        )
        bloomPass.threshold = 0.1
        bloomPass.strength = 0.75
        bloomPass.radius = 1
        const outputPass = new OutputPass()

        this.composer = new EffectComposer(this.renderer)
        this.composer.addPass(renderScene)
        this.composer.addPass(bloomPass)
        this.composer.addPass(outputPass)

        windowFrame.appendChild(this.renderer.domElement)
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.lightAmbient = new THREE.AmbientLight(0x000000)
        this.scene.add(this.lightAmbient)

        // Add a point light to add shadows
        // https://github.com/mrdoob/three.js/pull/14087#issuecomment-431003830

        this.topLight = new THREE.PointLight(0xfefcfc, 0.5)
        this.topLight.position.set(0, 0, 4)
        this.topLight.castShadow = true
        this.topLight.intensity = 1
        this.scene.add(this.topLight)

        this.bottomLight = new THREE.PointLight(0xccccff, 0.5)
        this.bottomLight.position.set(0, 0, 0.4)
        this.bottomLight.castShadow = false
        this.bottomLight.intensity = 0.2
        this.scene.add(this.bottomLight)

        const lightPoint2 = this.topLight.clone()
        lightPoint2.intensity = 3
        lightPoint2.castShadow = true
        this.scene.add(lightPoint2)

        const mapSize = 1024 // Default 512
        const cameraNear = 0.5 // Default 0.5
        const cameraFar = 50 // Default 500
        this.topLight.shadow.mapSize.width = mapSize
        this.topLight.shadow.mapSize.height = mapSize
        this.topLight.shadow.camera.near = cameraNear
        this.topLight.shadow.camera.far = cameraFar

        // Add a plane
        const geometryPlane = new THREE.PlaneGeometry(
            window.innerWidth / 30,
            window.innerHeight / 30,
            1,
            1
        )
        const materialPlane = new THREE.MeshPhongMaterial({ color: 0x888888 })

        this.plane = new THREE.Mesh(geometryPlane, materialPlane)
        this.plane.position.z = 0
        this.plane.receiveShadow = true
        this.scene.add(this.plane)
        this.glyphs = new THREE.Group()
        for (let z = 0; z <= 4; z++) {
            for (let y = (4 - z) * -1; y <= 4 - z; y++) {
                for (let x = (4 - z) * -1; x <= 4 - z; x++) {
                    this.createGlyph(
                        T[Math.ceil(Math.random() * T.length)],
                        [x * 0.35, y * 0.45, z * 0.5],
                        -Math.PI / 2,
                        x === -z || x === z
                            ? Math.PI / 2
                            : y === -z || y === -z
                              ? -Math.PI / 2
                              : 0
                    )
                    this.createGlyph(
                        T[Math.ceil(Math.random() * T.length)],
                        [x * 0.35, y * 0.45, z * 0.5 + 0.285],
                        0,
                        0
                    )
                }
            }
        }
        this.glyphs.position.z = 0
        this.scene.add(this.glyphs)
        // Init animation
        this.animate()
    }
    exportJPG() {
        const win = window.open('', 'Canvas Image')
        const { domElement } = this.renderer
        // Makse sure scene is rendered.
        this.composer.render(this.scene, this.camera)
        const src = domElement.toDataURL()
        if (!win) return
        win.document.write(
            `<img src='${src}' width='${domElement.width}' height='${domElement.height}'>`
        )
    }
    initListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this), false)
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.composer.setSize(window.innerWidth, window.innerHeight)
    }

    animate() {
        this.req = requestAnimationFrame(() => {
            this.animate()
        })
        this.glyphs.rotation.z += 0.005
        if (this.mixer && this.clock) mixer.update(this.clock.getDelta())
        if (this.stats) this.stats.update()
        if (this.controls) this.controls.update()
        // this.renderer.render(this.scene, this.camera)
        this.composer.render()
    }
    stop() {
        console.log('Stopped')
        cancelAnimationFrame(this.req)
    }
}

window.addEventListener('DOMContentLoaded', () => {
    let sketch = new App()
    const loader = document.getElementById('loading')
    windowFrame.removeChild(loader)
    window.init = () => window.location.reload()
    window.download = () => sketch.exportJPG()
    window.infobox = infobox
    handleAction()
})
