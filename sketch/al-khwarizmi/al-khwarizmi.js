import * as three from 'three'

const glslify = require('glslify')

let camera, scene, renderer, clock, particleTopoTexture, particles
const windowFrame = document.getElementById('windowFrame')

const geometry = new three.InstancedBufferGeometry()
// positions
const positions = new three.BufferAttribute(new Float32Array(4 * 3), 3)
positions.setXYZ(0, -0.5, 0.5, 0.0)
positions.setXYZ(1, 0.5, 0.5, 0.0)
positions.setXYZ(2, -0.5, -0.5, 0.0)
positions.setXYZ(3, 0.5, -0.5, 0.0)
geometry.setAttribute('position', positions)
// uvs
const uvs = new three.BufferAttribute(new Float32Array(4 * 2), 2)
uvs.setXYZ(0, 0.0, 0.0)
uvs.setXYZ(1, 1.0, 0.0)
uvs.setXYZ(2, 0.0, 1.0)
uvs.setXYZ(3, 1.0, 1.0)
geometry.setAttribute('uv', uvs)
// index
geometry.setIndex(
    new three.BufferAttribute(new Uint16Array([0, 2, 1, 2, 3, 1]), 1)
)

const loader = new three.TextureLoader()
loader.load('./assets/al-khwarizmi.jpg', (texture) => {
    let numVisible = 0
    particleTopoTexture = texture
    particleTopoTexture.format = three.RGBAFormat
    particleTopoTexture.minFilter = three.LinearFilter
    particleTopoTexture.magFilter = three.LinearFilter

    const threshold = 34
    const img = particleTopoTexture.image
    const numPoints = img.width * img.height
    const uniforms = {
        uTime: { value: 0 },
        uRandom: { value: 1.0 },
        uDepth: { value: 2.0 },
        uSize: { value: 0.0 },
        uTextureSize: { value: new THREE.Vector2(img.width, img.height) },
        uTexture: { value: particleTopoTexture },
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

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = img.width
    canvas.height = img.height
    ctx.scale(1, -1)
    ctx.drawImage(img, 0, 0, img.width, img.height * -1)
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const originalColors = Float32Array.from(imgData.data)
    for (let i = 0; i < this.numPoints; i++) {
        if (originalColors[i * 4 + 0] > threshold) numVisible++
    }
    const indices = new Uint16Array(numVisible)
    const offsets = new Float32Array(numVisible * 3)
    const angles = new Float32Array(numVisible)
    for (let i = 0; i < numPoints; i++) {
        if (originalColors[i * 4 + 0] > threshold) continue

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

    particles = new THREE.Mesh(geometry, material)
    this.container.add(this.object3D)
})

const alKhwarizmi = {
    init: () => {
        scene = new three.Scene()
        camera = new three.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            1,
            10000
        )
        camera.position.z = 300
        renderer = new three.WebGLRenderer({ antialias: true, alpha: true })
        clock = new three.Clock(true)
        windowFrame.appendChild(renderer.domElement)
        window.addEventListener('resize', alKhwarizmi.onWindowResize, false)
        alKhwarizmi.render()
    },
    onWindowResize: () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
    },
    render: () => {
        const delta = clock.getDelta()
        const time = clock.getElapsedTime() * 10
        renderer.render(scene, camera)
    },
    animate: () => {
        requestAnimationFrame(alKhwarizmi.animate)
        if (alKhwarizmi.render !== undefined) alKhwarizmi.render()
    },
    launch: () => {
        alKhwarizmi.init()
        alKhwarizmi.animate()
    }
}
export default alKhwarizmi
