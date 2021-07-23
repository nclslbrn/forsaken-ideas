import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter'
import { generateHeight } from './generate'
import { SceneUtils } from 'three/examples/jsm/utils/SceneUtils'
import paramSlider from '../../src/js/sketch-common/param-slider'
import Notification from '../../src/js/sketch-common/Notification'

const windowFrame = document.getElementById('windowFrame')

const params = {
    resolution: {
        value: 110,
        options: { min: 30, max: 180, step: 1, label: 'Resolution' }
    },
    builds: {
        value: 50,
        options: { min: 1, max: 100, step: 1, label: 'Buildings' }
    }
}

const paramBox = document.createElement('div')
paramBox.id = 'interactiveParameter'
for (const i in params) {
    const elems = paramSlider(params[i])
    elems.forEach((elem) => {
        paramBox.appendChild(elem)
    })
}
windowFrame.appendChild(paramBox)

const sketch = {
    zRot: 0,
    meshSize: { w: 5000, h: 5000 },
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
    launch: () => {
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
        windowFrame.appendChild(sketch.renderer.domElement)
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
        sketch.init()
        sketch.animate()
    },
    init: () => {
        // Before add new object remove previous
        if (sketch.scene.getObjectByName('landscape')) {
            const previous = sketch.scene.getObjectByName('landscape')
            sketch.scene.remove(previous)
            new Notification(
                'Previous landscape was removed.',
                windowFrame,
                'dark'
            )
        }

        const data = generateHeight(
            params['resolution'].value,
            params['resolution'].value,
            sketch.seed,
            params['builds'].value
        )
        sketch.geometry = new THREE.PlaneGeometry(
            sketch.meshSize.w,
            sketch.meshSize.h,
            params['resolution'].value - 1,
            params['resolution'].value - 1
        )

        sketch.geometry.rotateX(-Math.PI / 2)
        const vertices = sketch.geometry.attributes.position.array
        for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
            vertices[j + 1] = data[i] * 10
        }
        const meshMaterials = [
            new THREE.MeshBasicMaterial({ color: 0x2c3e50 }),
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                wireframe: true,
                transparent: true
            })
        ]
        sketch.object = SceneUtils.createMultiMaterialObject(
            sketch.geometry,
            meshMaterials
        )
        sketch.object.name = 'landscape'
        sketch.object.position.set(0, -1500, 0)
        sketch.scene.add(sketch.object)
        //console.log(sketch.scene)
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
        sketch.zRot += 0.003
        sketch.object.rotation.set(0, sketch.zRot, 0)
        if (sketch.render !== undefined) sketch.render()
    },
    export: () => {
        const date = new Date(),
            Y = date.getFullYear(),
            m = date.getMonth(),
            d = date.getDay(),
            H = date.getHours(),
            i = date.getMinutes()

        const filename = `landline.${Y}-${m}-${d}_${H}.${i}.stl`

        const land = new THREE.Mesh(
            sketch.geometry,
            new THREE.MeshBasicMaterial({ color: 0x000000 })
        )
        const landGeom = sketch.geometry.clone(true)

        land.geometry = landGeom
        land.geometry.scale(
            100 / sketch.meshSize.w,
            100 / sketch.meshSize.h,
            100 / sketch.meshSize.h
        )
        land.geometry.rotateX(Math.PI / 2)
        const result = sketch.exporter.parse(land, { binary: true })
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
