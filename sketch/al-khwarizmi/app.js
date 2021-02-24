import * as THREE from 'three'
import brightPoint from './brightPoint'
let geometry, material
const windowFrame = document.getElementById('windowFrame')
const images = ['./assets/sample-03.png', './assets/al-khwarizmi.jpg']

const app = {
    THREE: THREE,
    scene: new THREE.Scene(),
    clock: new THREE.Clock(),
    renderer: new THREE.WebGLRenderer({ antialias: true }),
    camera: new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        1,
        10000
    ),
    init: () => {
        const computePoints = new brightPoint(app)
        const object = computePoints.fromImg(images[0])
        app.scene.background = new THREE.Color(0x333333)

        app.renderer.setPixelRatio(window.devicePixelRatio)
        app.renderer.setSize(window.innerWidth, window.innerHeight)
        windowFrame.appendChild(app.renderer.domElement)

        geometry = new THREE.BoxGeometry(0.1, 1, 1)
        material = new THREE.MeshBasicMaterial({ color: 0xffffff })

        app.camera.position.z = 300
        app.scene.add(computePoints.container)
        window.addEventListener('resize', app.onWindowResize, false)
        app.render()
    },
    update: () => {
        const delta = this.clock.getDelta()
        if (this.computePoints) this.computePoints.update(delta)
    },
    onWindowResize: () => {
        if (!this.renderer) return
        app.camera.aspect = window.innerWidth / window.innerHeight
        // app.camera.updateProjectionMatrix()
        app.renderer.setSize(window.innerWidth, window.innerHeight)
    },
    render: () => {
        const delta = app.clock.getDelta()
        const time = app.clock.getElapsedTime() * 10
        app.renderer.render(app.scene, app.camera)
    },
    animate: () => {
        requestAnimationFrame(app.animate)
        if (app.render !== undefined) app.render()
    },
    launch: () => {
        app.init()
        app.animate()
    }
}
export default app
