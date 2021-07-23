import * as THREE from 'three'
import AutomataGrid from '../../src/js/sketch-common/AutomataGrid'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { SceneUtils } from 'three/examples/jsm/utils/SceneUtils'
import Notification from '../../src/js/sketch-common/Notification'
const windowFrame = document.getElementById('windowFrame')

const s = {
    grid: new AutomataGrid(12, 12),
    neededAliveNeighboors: 2,
    initPercentChanceAliveCell: 0.35,
    //meshSize: { w: 6, h: 6, d: 6 },
    clock: new THREE.Clock(),
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        20000
    ),
    object: new THREE.Object3D(),
    build: new THREE.Object3D(),
    zRot: 0,
    renderer: new THREE.WebGLRenderer({ antialias: true }),
    launch: () => {
        s.controls = new OrbitControls(s.camera, s.renderer.domElement)
        s.controls.screenSpacePanning = true
        s.defaulMat = [
            new THREE.MeshBasicMaterial({
                color: 0xffffff
            }),
            new THREE.MeshBasicMaterial({
                color: 0x000000,
                wireframe: true,
                transparent: true
            })
        ]
        s.defaultGeom = new THREE.BoxGeometry(
            1 / s.grid.cols,
            1 / s.grid.rows,
            1 / s.grid.rows
        )
        s.object = SceneUtils.createMultiMaterialObject(
            s.defaultGeom,
            s.defaulMat
        )
        s.renderer.setPixelRatio(window.devicePixelRatio)
        s.renderer.setSize(window.innerWidth, window.innerHeight)
        s.camera.position.z = Math.max(s.grid.cols, s.grid.rows) / 4
        s.camera.lookAt(0, 0, 0)
        windowFrame.appendChild(s.renderer.domElement)
        window.addEventListener('resize', s.onWindowResize, false)

        s.init()
        s.animate()
    },
    init: () => {
        s.grid.init(s.initPercentChanceAliveCell)
        s.grid.update()
        s.scene.background = new THREE.Color(0x000000)
        s.scene.fog = new THREE.FogExp2(0xffffff, 0.07)
        s.build.name = 'chrystal'
        s.drawgrid()
        s.render()
    },
    onWindowResize: () => {
        s.camera.aspect = window.innerWidth / window.innerHeight
        s.camera.updateProjectionMatrix()
        s.renderer.setSize(window.innerWidth, window.innerHeight)
    },
    render: () => {
        s.renderer.render(s.scene, s.camera)
    },
    animate: () => {
        requestAnimationFrame(s.animate)

        s.zRot++
        s.build.rotation.set(0, s.zRot / 100, 0)

        if (s.zRot % 30 == 0) {
            s.grid.update()
            s.drawgrid()
        }

        if (s.render !== undefined) s.render()
    },
    addMesh: (x, y) => {
        const clone = s.object.clone(true)
        clone.position.set(
            -1 / s.grid.cols + (1 / s.grid.cols) * x,
            -1 / s.grid.rows + (1 / s.grid.rows) * y,
            0
        )
        return clone
    },
    drawgrid: () => {
        s.build.clear()
        if (s.scene.getObjectByName('chrystal')) {
            s.scene.remove(s.scene.getObjectByName('chrystal'))
            /*   new Notification(
                'Previous construction was removed.',
                windowFrame,
                'dark'
            ) */
        }
        const group = new THREE.Group()
        for (let x = 0; x <= s.grid.cols; x++) {
            for (let y = 0; y <= s.grid.rows; y++) {
                const i = x * s.grid.cols + y

                // top and bottom
                if (
                    y > 0 &&
                    y < s.grid.rows &&
                    s.grid.value[i - s.grid.rows] &&
                    s.grid.value[i + s.grid.rows]
                ) {
                    group.add(s.addMesh(x, y))
                }
                // left & right
                if (
                    x > 0 &&
                    x < s.grid.cols &&
                    s.grid.value[i + s.grid.cols] &&
                    s.grid.value[i - s.grid.cols]
                ) {
                    group.add(s.addMesh(x, y))
                }
                // top & left
                if (
                    x > 0 &&
                    y > 0 &&
                    s.grid.value[i - 1] &&
                    s.grid.value[i - s.grid.cols]
                ) {
                    group.add(s.addMesh(x - 1, y - 1))
                }
                // top & right
                if (
                    x < s.grid.cols &&
                    y > 0 &&
                    s.grid.value[i - 1] &&
                    s.grid.value[i + s.grid.cols]
                ) {
                    group.add(s.addMesh(x + 1, y - 1))
                }
                // bottom & right
                if (
                    x < s.grid.cols &&
                    y < s.grid.rows &&
                    s.grid.value[i + 1] &&
                    s.grid.value[i + s.grid.cols]
                ) {
                    group.add(s.addMesh(x + 1, y + 1))
                }
                // bottom & left
                if (
                    x > 0 &&
                    y < s.grid.rows &&
                    s.grid.value[i + 1] &&
                    s.grid.value[i - s.grid.cols]
                ) {
                    group.add(s.addMesh(x - 1, y + 1))
                }
            }
        }

        const xMirror = group.clone(true)
        xMirror.scale.set(-1, 1, 1)

        const zCopy = group.clone(true)
        zCopy.rotation.set(0, Math.PI / 2, 0)

        const zMirror = group.clone(true)
        zMirror.rotation.set(0, Math.PI * 1.5, 0)

        const yMirror = new THREE.Group()
        yMirror.add(group.clone(true))
        yMirror.add(xMirror.clone(true))
        yMirror.add(zCopy.clone(true))
        yMirror.add(zMirror.clone(true))
        yMirror.scale.set(1, -1, 1)

        s.build.add(group)
        s.build.add(xMirror)
        s.build.add(zCopy)
        s.build.add(zMirror)
        s.build.add(yMirror)

        s.scene.add(s.build)
    }
}
export default s
