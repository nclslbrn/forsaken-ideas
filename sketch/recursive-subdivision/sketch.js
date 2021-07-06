import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'
import { generateHslaColors } from './../../src/js/sketch-common/generateHslaColors'
import hslToHex from './hslToHex'

const randomBetween = (interval = { min: 0, max: 1 }) => {
    return interval.min + Math.random() * (interval.max - interval.min)
}
const save = (blob, filename) => {
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
}
const saveString = (text, filename) => {
    save(new Blob([text], { type: 'text/plain' }), filename)
}
const saveArrayBuffer = (buffer, filename) => {
    save(new Blob([buffer], { type: 'application/octet-stream' }), filename)
}
const link = document.createElement('a')
link.style.display = 'none'
document.body.appendChild(link)

const sketch = {
    size: { w: window.innerWidth, h: window.innerHeight },
    thickness: 0.01,
    decrease: 0.9,
    expectedDivisions: 124,
    cubeDimension: 4,
    subSize: { min: 0.25, max: 0.75 },
    divisions: [],
    camera: new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.001,
        200
    ),
    scene: new THREE.Scene(),
    renderer: new THREE.WebGLRenderer(),
    material: new THREE.MeshPhongMaterial({ color: 0xffffff }),
    controls: false,
    exporter: new GLTFExporter(),
    launch: () => {
        sketch.camera.position.z = sketch.cubeDimension * 2
        sketch.scene.background = new THREE.Color(0, 0, 0)
        sketch.scene.add(new THREE.AmbientLight(0xffffff, 0.6))
        const dirLights = [
            new THREE.DirectionalLight(0xffffff, 0.6),
            new THREE.DirectionalLight(0xffffff, 0.6)
        ]
        dirLights[0].position.set(-10, -10, 10)
        dirLights[1].position.set(10, 10, 10)
        dirLights.forEach((light) => {
            sketch.scene.add(light)
        })
        sketch.renderer.setSize(sketch.size.w, sketch.size.h)
        document
            .getElementById('windowFrame')
            .appendChild(sketch.renderer.domElement)

        sketch.controls = new OrbitControls(
            sketch.camera,
            sketch.renderer.domElement
        )
        sketch.controls.screenSpacePanning = true
        window.addEventListener('resize', sketch.onWindowResize, false)
        sketch.init()
    },
    init: () => {
        sketch.clean()
        sketch.divisions = [
            {
                w: sketch.cubeDimension,
                h: sketch.cubeDimension,
                x: 0,
                y: 0,
                pos: 0
            }
        ]
        sketch.update()
        sketch.render()
    },
    subdivision: (props) => {
        if (props) {
            const { w, h, x, y, chance, isVert, pos } = props
            if (chance > Math.random()) {
                if (isVert) {
                    const nW = randomBetween(sketch.subSize).toPrecision(4) * w
                    sketch.subdivision({
                        w: nW,
                        h: h,
                        x: x - (w - nW) / 2,
                        y: y,
                        chance: chance * sketch.decrease,
                        isVert: false,
                        pos: pos + 1
                    })
                    sketch.subdivision({
                        w: w - nW,
                        h: h,
                        x: x + nW / 2,
                        y: y,
                        chance: chance * sketch.decrease,
                        isVert: false,
                        pos: pos + 1
                    })
                } else {
                    const nH = randomBetween(sketch.subSize).toPrecision(4) * h
                    sketch.subdivision({
                        w: w,
                        h: nH,
                        x: x,
                        y: y - (h - nH) / 2,
                        chance: chance * sketch.decrease,
                        isVert: true,
                        pos: pos + 1
                    })
                    sketch.subdivision({
                        w: w,
                        h: h - nH,
                        x: x,
                        y: y + nH / 2,
                        chance: chance * sketch.decrease,
                        isVert: true,
                        pos: pos + 1
                    })
                }
            } else {
                const newDivision = {
                    x: x,
                    y: y,
                    w: w - sketch.thickness,
                    h: h - sketch.thickness,
                    pos: pos
                }
                sketch.divisions.push(newDivision)
            }
        }
    },
    clean: () => {
        const toKeep = ['DirectionalLight', 'AmbientLight']
        sketch.scene.children.forEach((child) => {
            if (!toKeep.includes(child.type)) {
                sketch.scene.remove(child)
            }
        })
    },
    update: () => {
        const randDivisionIndex = Math.floor(
            Math.random() * sketch.divisions.length
        )
        let nextDivisionProps = { ...sketch.divisions[randDivisionIndex] }
        nextDivisionProps.chance = Math.random()
        nextDivisionProps.isVert = Math.random() < 0.5
        sketch.divisions.splice(randDivisionIndex, 1)
        sketch.subdivision(nextDivisionProps)

        if (sketch.divisions.length < sketch.expectedDivisions) {
            requestAnimationFrame(sketch.update)
        } else {
            sketch.notify(`We got ${sketch.divisions.length} divisions`)
            sketch.draw()
        }
    },
    draw: () => {
        sketch.clean()
        const depth = 0.5
        const frontGroup = new THREE.Group()
        const maxPos = sketch.divisions.reduce((acc, division) => {
            return division.pos > acc ? division.pos : acc
        }, 0)
        const posMaterials = []
        const hslColor = generateHslaColors(100, 50, 100, maxPos)

        for (let h = 0; h < maxPos; h++) {
            const hex = hslToHex(hslColor[h][0], hslColor[h][1], hslColor[h][2])
            posMaterials[h] = sketch.material.clone()
            posMaterials[h].color.setHex(hex)
        }

        for (let i = 0; i < sketch.divisions.length; i++) {
            const cubeDepth = depth * (1 / sketch.divisions[i].pos)
            const geometry = new THREE.BoxGeometry(
                sketch.divisions[i].w,
                sketch.divisions[i].h,
                cubeDepth
            )
            const cube = new THREE.Mesh(
                geometry,
                posMaterials[sketch.divisions[i].pos]
            )
            cube.position.set(
                sketch.divisions[i].x,
                sketch.divisions[i].y,
                cubeDepth / 2
            )
            frontGroup.add(cube)
        }
        const baseGeo = new THREE.BoxGeometry(
            sketch.cubeDimension,
            sketch.cubeDimension,
            sketch.cubeDimension
        )
        const base = new THREE.Mesh(baseGeo, sketch.material)
        const leftGroup = frontGroup.clone(true)
        const rightGroup = frontGroup.clone(true)
        const topGroup = frontGroup.clone(true)
        const bottomGroup = frontGroup.clone(true)
        const backGroup = frontGroup.clone(true)

        frontGroup.position.set(0, 0, sketch.cubeDimension / 2)
        topGroup.position.set(0, sketch.cubeDimension / 2, 0)
        topGroup.rotateOnWorldAxis(
            new THREE.Vector3(1, 0, 0),
            THREE.Math.degToRad(-90)
        )
        topGroup.rotateOnWorldAxis(
            new THREE.Vector3(0, 1, 0),
            THREE.Math.degToRad(-90)
        )

        bottomGroup.position.set(0, -sketch.cubeDimension / 2, 0)
        bottomGroup.rotateOnWorldAxis(
            new THREE.Vector3(1, 0, 0),
            THREE.Math.degToRad(90)
        )
        bottomGroup.rotateOnWorldAxis(
            new THREE.Vector3(0, 1, 0),
            THREE.Math.degToRad(-90)
        )

        leftGroup.position.set(-sketch.cubeDimension / 2, 0, 0)
        leftGroup.rotateOnWorldAxis(
            new THREE.Vector3(0, 1, 0),
            THREE.Math.degToRad(-90)
        )
        leftGroup.rotateOnWorldAxis(
            new THREE.Vector3(1, 0, 0),
            THREE.Math.degToRad(90)
        )

        rightGroup.position.set(sketch.cubeDimension / 2, 0, 0)
        rightGroup.rotateOnWorldAxis(
            new THREE.Vector3(0, 1, 0),
            THREE.Math.degToRad(90)
        )
        rightGroup.rotateOnWorldAxis(
            new THREE.Vector3(1, 0, 0),
            THREE.Math.degToRad(90)
        )

        backGroup.position.set(0, 0, -sketch.cubeDimension / 2)
        backGroup.rotateOnWorldAxis(
            new THREE.Vector3(1, 0, 0),
            THREE.Math.degToRad(-180)
        )
        sketch.scene.add(base)
        sketch.scene.add(frontGroup)
        sketch.scene.add(topGroup)
        sketch.scene.add(bottomGroup)
        sketch.scene.add(leftGroup)
        sketch.scene.add(rightGroup)
        sketch.scene.add(backGroup)
        sketch.renderer.render(sketch.scene, sketch.camera)
    },

    render: () => {
        requestAnimationFrame(sketch.render)
        sketch.renderer.render(sketch.scene, sketch.camera)
    },

    /**
     * Fancy notification
     */
    notify: (message) => {
        const p = document.createElement('p')
        p.id = 'notification'
        p.innerHTML = message
        document.getElementById('windowFrame').appendChild(p)
        window.setTimeout(() => {
            document.getElementById('windowFrame').removeChild(p)
        }, 5000)
    },
    export: () => {
        sketch.exporter.parse(sketch.scene, (result) => {
            if (result instanceof ArrayBuffer) {
                saveArrayBuffer(result, 'scene.glb')
            } else {
                const output = JSON.stringify(result, null, 2)
                saveString(output, 'scene.gltf')
            }
        })
    },
    onWindowResize: () => {
        sketch.renderer.setSize(window.innerWidth, window.innerHeight)
    }
}

export { sketch }
