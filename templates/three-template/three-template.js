import * as three from 'three'
let camera, scene, renderer, clock
let geometry, material, cube
const windowFrame = document.getElementById('windowFrame')

const threeTemplate = {
    init: () => {
        camera = new three.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            1,
            20000
        )
        //camera.position.y = 200
        clock = new three.Clock()
        scene = new three.Scene()
        scene.background = new THREE.Color(0x333333)
        scene.fog = new THREE.FogExp2(0xaaccff, 0.0007)
        renderer = new three.WebGLRenderer({ antialias: true })

        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.setSize(window.innerWidth, window.innerHeight)
        windowFrame.appendChild(renderer.domElement)

        geometry = new three.BoxGeometry(0.1, 1, 1)
        material = new three.MeshBasicMaterial({ color: 0xffffff })
        cube = new three.Mesh(geometry, material)
        cube.rotation.x = Math.PI * 0.5
        cube.rotation.y = Math.PI * -0.5
        scene.add(cube)
        camera.position.z = 5
        window.addEventListener('resize', threeTemplate.onWindowResize, false)
        threeTemplate.render()
    },
    onWindowResize: () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
    },
    render: () => {
        const delta = clock.getDelta()
        const time = clock.getElapsedTime() * 10
        cube.rotation.z += 0.01
        renderer.render(scene, camera)
    },
    animate: () => {
        requestAnimationFrame(threeTemplate.animate)
        if (threeTemplate.render !== undefined) threeTemplate.render()
    },
    launch: () => {
        threeTemplate.init()
        threeTemplate.animate()
    }
}
export default threeTemplate
