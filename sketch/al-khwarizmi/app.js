// Based on interactive particles from Bruno Imbrizi
// https://github.com/brunoimbrizi/interactive-particles/blob/master/src/scripts/webgl/particles/Particles.js
'use strict'
import * as THREE from 'three'
import brightPoint from './brightPoint'
import { WEBGL } from '../../src/js/sketch-common/WebGL'
const windowFrame = document.getElementById('windowFrame')
const images = ['./assets/sample-03.png', './assets/al-khwarizmi.jpg']

const app = {
    init: () => {
        app.THREE = THREE
        app.scene = new THREE.Scene()
        app.clock = new THREE.Clock()
        app.camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            1,
            10000
        )
        app.renderer = new THREE.WebGLRenderer({ antialias: true })

        app.pointSampler = new brightPoint(app)
        app.pointSampler.fromImg(images[0])

        app.scene.background = new THREE.Color(0x333333)
        app.renderer.setPixelRatio(window.devicePixelRatio)
        app.renderer.setSize(window.innerWidth, window.innerHeight)
        if (!windowFrame) return

        app.camera.position.z = 300
        app.scene.add(app.pointSampler.container)

        if (WEBGL.isWebGLAvailable()) {
            windowFrame.appendChild(app.renderer.domElement)
            window.addEventListener('resize', app.onWindowResize, false)
            app.animate()
        } else {
            const warning = WEBGL.getWebGLErrorMessage()
            windowFrame.appendChild(warning)
        }
    },
    onWindowResize: () => {
        if (!app.renderer) return
        app.camera.aspect = window.innerWidth / window.innerHeight
        app.camera.updateProjectionMatrix()
        app.renderer.setSize(window.innerWidth, window.innerHeight)
    },
    animate: () => {
        const delta = app.clock.getDelta()
        if (app.pointSampler) app.pointSampler.update(delta)
        if (app.renderer !== undefined)
            app.renderer.render(app.scene, app.camera)

        requestAnimationFrame(app.animate.bind(app))
    }
}
export default app
