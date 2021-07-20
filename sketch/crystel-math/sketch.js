import * as THREE from 'three'
import AutomataGrid from '../../src/js/sketch-common/AutomataGrid'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { SceneUtils } from 'three/examples/jsm/utils/SceneUtils'
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
        s.camera.position.z = Math.max(s.grid.cols, s.grid.rows) / 2
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
        if (s.render !== undefined) s.render()
    },
    cleanScene: () => {
        const toKeep = ['DirectionalLight', 'AmbientLight']
        s.scene.children.forEach((child) => {
            if (!toKeep.includes(child.type)) {
                s.scene.remove(child)
            }
        })
    },
    addMesh: (x, y) => {
        const clone = s.object.clone(true)
        clone.position.set((1 / s.grid.cols) * x, (1 / s.grid.rows) * y, 0)
        return clone
    },
    drawgrid: () => {
        s.cleanScene()
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

        const yGroup = group.clone(true)
        yGroup.rotateY(Math.PI / 2)
        const yMirror = yGroup.clone(true)
        yMirror.scale.set(1, -1, 1)

        s.scene.add(group)
        s.scene.add(xMirror)
        s.scene.add(yGroup)
        s.scene.add(yMirror)
    }
}
export default s
