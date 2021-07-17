import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { SVGRenderer } from 'three/examples/jsm/renderers/SVGRenderer'
import { generateHeight } from './generate'

const sketch = {
    width: 64,
    depth: 64,
    clock: new THREE.Clock(),
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        20000
    ),
    renderer: new THREE.WebGLRenderer({ antialias: true }),
    init: () => {
        sketch.clock = new THREE.Clock()
        sketch.scene = new THREE.Scene()
        sketch.scene.background = new THREE.Color(0x333333)
        sketch.renderer = new SVGRenderer()
        sketch.renderer.setPixelRatio(window.devicePixelRatio)
        sketch.renderer.setSize(window.innerWidth, window.innerHeight)
        document
            .getElementById('windowFrame')
            .appendChild(sketch.renderer.domElement)
        sketch.camera.position.set(0, 3000, 800)
        sketch.camera.lookAt(0, 0, 0)

        sketch.scene.add(new THREE.AmbientLight(0xffffff, 1.0))
        const dirLights = [
            new THREE.DirectionalLight(0xffffff, 0.6),
            new THREE.DirectionalLight(0xffffff, 0.6)
        ]
        dirLights[0].position.set(0, -sketch.width, -sketch.depth)
        dirLights[1].position.set(10, sketch.width, sketch.depth)
        dirLights.forEach((light) => {
            sketch.scene.add(light)
        })

        sketch.controls = new OrbitControls(
            sketch.camera,
            sketch.renderer.domElement
        )
        sketch.controls.screenSpacePanning = true
        document.addEventListener('keypress', sketch.onkeypress, false)
        window.addEventListener('resize', sketch.onWindowResize, false)
        const data = generateHeight(sketch.width, sketch.depth)
        const geometry = new THREE.PlaneGeometry(
            3000,
            3000,
            sketch.width - 1,
            sketch.depth - 1
        )
        geometry.rotateX(-Math.PI / 2)
        const vertices = geometry.attributes.position.array
        for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
            vertices[j + 1] = data[i] * 10
        }
        //const material = new THREE.MeshBasicMaterial({ wireframe: true })
        const edgeGeo = new THREE.EdgesGeometry(geometry)
        const lines = new THREE.LineSegments(
            edgeGeo,
            new THREE.LineBasicMaterial({
                color: new THREE.Color('white')
            })
        )
        sketch.scene.add(lines)
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
        let svgFile = null
        const date = new Date(),
            Y = date.getFullYear(),
            m = date.getMonth(),
            d = date.getDay(),
            H = date.getHours(),
            i = date.getMinutes()

        const filename = `landline.${Y}-${m}-${d}_${H}.${i}.svg`
        const svgMarkup = document.querySelector('#windowFrame svg').outerHTML
        const data = new Blob([svgMarkup], {
            type: 'text/plain'
        })
        if (svgFile !== null) {
            window.URL.revokeObjectURL(svgFile)
        }
        svgFile = window.URL.createObjectURL(data)
        const link = document.createElement('a')
        link.href = svgFile
        link.download = filename
        link.click()
    }
}
export default sketch
