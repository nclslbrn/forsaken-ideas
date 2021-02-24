// Based on interactive particles from Bruno Imbrizi
// https://github.com/brunoimbrizi/interactive-particles/blob/master/src/scripts/webgl/particles/Particles.js
import * as THREE from 'three'
const glslify = require('glslify')

export default class brightPoint {
    constuctor(app) {
        this.app = app
        // console.log(this.container)
    }
    fromImg(src) {
        this.container = new THREE.Object3D()
        const loader = new THREE.TextureLoader()
        loader.load(src, (texture) => {
            this.texture = texture
            this.texture.minFilter = THREE.LinearFilter
            this.texture.magFilter = THREE.LinearFilter
            this.texture.format = THREE.RGBFormat

            this.width = texture.image.width
            this.height = texture.image.height

            this.get()
        })
    }
    get() {
        // How many bright point we have
        let numVisible = 0
        this.numPoints = this.width * this.height
        const threshold = 34
        let originalColors

        const img = this.texture.image
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = this.width
        canvas.height = this.height
        ctx.scale(1, -1)
        ctx.drawImage(img, 0, 0, this.width, this.height * -1)

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        originalColors = Float32Array.from(imgData.data)

        for (let i = 0; i < this.numPoints; i++) {
            if (originalColors[i * 4 + 0] > threshold) numVisible++
        }

        console.log('numVisible', numVisible, this.numPoints)

        // Map to geometry
        const uniforms = {
            uTime: { value: 0 },
            uRandom: { value: 1.0 },
            uDepth: { value: 2.0 },
            uSize: { value: 0.0 },
            uTextureSize: {
                value: new THREE.Vector2(this.width, this.height)
            },
            uTexture: { value: this.texture },
            uTouch: { value: null }
        }

        const material = new THREE.RawShaderMaterial({
            uniforms,
            vertexShader: glslify(require('./assets/particle.vert')),
            fragmentShader: glslify(require('./assets/particle.frag')),
            depthTest: false,
            transparent: true
            // blending: THREE.AdditiveBlending
        })

        const geometry = new THREE.InstancedBufferGeometry()

        // positions
        const positions = new THREE.BufferAttribute(new Float32Array(4 * 3), 3)
        positions.setXYZ(0, -0.5, 0.5, 0.0)
        positions.setXYZ(1, 0.5, 0.5, 0.0)
        positions.setXYZ(2, -0.5, -0.5, 0.0)
        positions.setXYZ(3, 0.5, -0.5, 0.0)
        geometry.setAttribute('position', positions)

        // uvs
        const uvs = new THREE.BufferAttribute(new Float32Array(4 * 2), 2)
        uvs.setXYZ(0, 0.0, 0.0)
        uvs.setXYZ(1, 1.0, 0.0)
        uvs.setXYZ(2, 0.0, 1.0)
        uvs.setXYZ(3, 1.0, 1.0)
        geometry.setAttribute('uv', uvs)

        // index
        geometry.setIndex(
            new THREE.BufferAttribute(new Uint16Array([0, 2, 1, 2, 3, 1]), 1)
        )

        const indices = new Uint16Array(numVisible)
        const offsets = new Float32Array(numVisible * 3)
        const angles = new Float32Array(numVisible)
        for (let i = 0, j = 0; i < this.numPoints; i++) {
            if (originalColors[i * 4 + 0] <= threshold) continue

            offsets[j * 3 + 0] = i % this.width
            offsets[j * 3 + 1] = Math.floor(i / this.width)

            indices[j] = i

            angles[j] = Math.random() * Math.PI

            j++
        }

        geometry.setAttribute(
            'pindex',
            new THREE.InstancedBufferAttribute(indices, 1, false)
        )
        geometry.setAttribute(
            'offset',
            new THREE.InstancedBufferAttribute(offsets, 3, false)
        )
        geometry.setAttribute(
            'angle',
            new THREE.InstancedBufferAttribute(angles, 1, false)
        )

        /*         
        this.object3D = new THREE.Mesh(geometry, material)
        if (this.object3D && this.container) {
            this.container.add(this.object3D)
        } 
        */
    }

    update(delta) {
        if (!this.object3D) return
        // if (this.touch) this.touch.update();

        this.object3D.material.uniforms.uTime.value += delta
    }
}
