import * as three from 'three'
import AutomataGrid from '../../src/js/sketch-common/AutomataGrid'
const windowFrame = document.getElementById('windowFrame')

const s = {
    grid: new AutomataGrid(6, 6),
    neededAliveNeighboors: 2,
    initPercentChanceAliveCell: 0.35,
    //meshSize: { w: 6, h: 6, d: 6 },
    clock: new three.Clock(),
    scene: new three.Scene(),
    camera: new three.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        20000
    ),
    renderer: new three.WebGLRenderer({ antialias: true }),
    init: () => {
        s.defaulMat = new three.MeshBasicMaterial({ color: 0xffffff })
        s.defaultGeom = new THREE.BoxGeometry(
            1 / s.grid.cols,
            1 / s.grid.rows,
            1 / s.grid.rows
        )
        s.defaultMesh = new THREE.Mesh(s.defaultGeom, s.defaulMat)

        s.grid.init(s.initPercentChanceAliveCell)
        s.grid.update()
        //s.camera.position.y = 200
        s.camera.position.z = 5

        s.scene.background = new THREE.Color(0x333333)
        s.scene.fog = new THREE.FogExp2(0xaaccff, 0.0007)

        s.renderer.setPixelRatio(window.devicePixelRatio)
        s.renderer.setSize(window.innerWidth, window.innerHeight)
        windowFrame.appendChild(s.renderer.domElement)
        window.addEventListener('resize', s.onWindowResize, false)
        s.drawgrid()
        s.render()
    },
    onWindowResize: () => {
        s.camera.aspect = window.innerWidth / window.innerHeight
        s.camera.updateProjectionMatrix()
        s.renderer.setSize(window.innerWidth, window.innerHeight)
    },
    render: () => {
        // const delta = s.clock.getDelta()
        // const time = s.clock.getElapsedTime() * 10
        s.renderer.render(s.scene, s.camera)
    },
    animate: () => {
        requestAnimationFrame(s.animate)
        if (s.render !== undefined) s.render()
    },
    launch: () => {
        s.init()
        s.animate()
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
        const mesh = s.defaultMesh.clone(true)
        mesh.position.set((1 / s.grid.cols) * x, (1 / s.grid.rows) * y, 0)
        s.scene.add(mesh)
    },
    drawgrid: () => {
        s.cleanScene()

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
                    s.addMesh(x, y)
                }
                // left & right
                if (
                    x > 0 &&
                    x < s.grid.cols &&
                    s.grid.value[i + s.grid.cols] &&
                    s.grid.value[i - s.grid.cols]
                ) {
                    s.addMesh(x, y)
                }
                // top & left
                if (
                    x > 0 &&
                    y > 0 &&
                    s.grid.value[i - 1] &&
                    s.grid.value[i - s.grid.cols]
                ) {
                    s.addMesh(x - 1, y - 1)
                }
                // top & right
                if (
                    x < s.grid.cols &&
                    y > 0 &&
                    s.grid.value[i - 1] &&
                    s.grid.value[i + s.grid.cols]
                ) {
                    s.addMesh(x + 1, y - 1)
                }
                // bottom & right
                if (
                    x < s.grid.cols &&
                    y < s.grid.rows &&
                    s.grid.value[i + 1] &&
                    s.grid.value[i + s.grid.cols]
                ) {
                    s.addMesh(x + 1, y + 1)
                }
                // bottom & left
                if (
                    x > 0 &&
                    y < s.grid.rows &&
                    s.grid.value[i + 1] &&
                    s.grid.value[i - s.grid.cols]
                ) {
                    s.addMesh(x - 1, y + 1)
                }
            }
        }
    }
}
export default s
