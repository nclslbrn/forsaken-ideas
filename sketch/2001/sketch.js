import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter'
import { generateHeight } from './generate'
import { SceneUtils } from 'three/examples/jsm/utils/SceneUtils'

const sketch = {
    meshSize: { w: 5000, h: 5000 },
    width: 128,
    depth: 128,
    seed: 'superseed',
    clock: new THREE.Clock(),
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        20000
    ),
    renderer: new THREE.WebGLRenderer({ antialias: true }),
    exporter: new STLExporter(),
    init: () => {
        sketch.clock = new THREE.Clock()
        sketch.scene = new THREE.Scene()
        sketch.scene.background = new THREE.Color(0x2c3e50)
        sketch.scene.add(new THREE.AmbientLight(0xffffff, 0.6))
        const dirLights = [
            new THREE.DirectionalLight(0xffffff, 0.6),
            new THREE.DirectionalLight(0xffffff, 0.6)
        ]
        dirLights[0].position.set(
            -sketch.meshSize.w,
            -sketch.meshSize.h,
            sketch.meshSize.h
        )
        dirLights[1].position.set(
            sketch.meshSize.w,
            sketch.meshSize.h,
            sketch.meshSize.h
        )
        dirLights.forEach((light) => {
            sketch.scene.add(light)
        })
        sketch.renderer.setPixelRatio(window.devicePixelRatio)
        sketch.renderer.setSize(window.innerWidth, window.innerHeight)
        document
            .getElementById('windowFrame')
            .appendChild(sketch.renderer.domElement)
        sketch.camera.position.set(
            sketch.meshSize.w * 0.5,
            sketch.meshSize.h * 0.5,
            sketch.meshSize.h * 0.5
        )
        sketch.camera.lookAt(0, 0, 0)
        sketch.controls = new OrbitControls(
            sketch.camera,
            sketch.renderer.domElement
        )
        sketch.controls.screenSpacePanning = true
        document.addEventListener('keypress', sketch.onkeypress, false)
        window.addEventListener('resize', sketch.onWindowResize, false)
        const data = generateHeight(sketch.width, sketch.depth, sketch.seed)
        const geometry = new THREE.PlaneGeometry(
            sketch.meshSize.w,
            sketch.meshSize.h,
            sketch.width - 1,
            sketch.depth - 1
        )

        geometry.rotateX(-Math.PI / 2)
        const vertices = geometry.attributes.position.array
        for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
            vertices[j + 1] = data[i] * 10
        }
        const meshMaterial = [
            new THREE.MeshBasicMaterial({ color: 0x2c3e50 }),
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                wireframe: true,
                transparent: true
            })
        ]

        const mesh = SceneUtils.createMultiMaterialObject(
            geometry,
            meshMaterial
        )
        mesh.position.set(0, -1500, 0)

        sketch.landscape = new THREE.Object3D()
        sketch.landscape.add(mesh)

        sketch.scene.add(sketch.landscape)
        sketch.render()
    },
    onWindowResize: () => {
        sketch.camera.aspect = window.innerWidth / window.innerHeight
        sketch.camera.updateProjectionMatrix()
        sketch.renderer.setSize(window.innerWidth, window.innerHeight)
    },
    onkeypress: () => {
        console.log(sketch.camera)
    },
    render: () => {
        sketch.renderer.render(sketch.scene, sketch.camera)
    },
    animate: () => {
        requestAnimationFrame(sketch.animate)
        if (sketch.render !== undefined) sketch.render()
    },
    launch: () => {
        sketch.init()
        sketch.animate()
    },
    export: () => {
        const date = new Date(),
            Y = date.getFullYear(),
            m = date.getMonth(),
            d = date.getDay(),
            H = date.getHours(),
            i = date.getMinutes()

        const filename = `landline.${Y}-${m}-${d}_${H}.${i}.stl`
        const result = sketch.exporter.parse(sketch.landscape, { binary: true })
        const link = document.createElement('a')

        link.style.display = 'none'
        document.body.appendChild(link)
        link.href = URL.createObjectURL(
            new Blob([result], { type: 'application/octet-stream' }, filename)
        )
        link.download = filename
        link.click()
    }
}
export default sketch
