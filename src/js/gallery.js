import style from '../sass/gallery.scss'
import makeAcronym from './gallery/random-acronym-extend'
import randomHeroImage from './gallery/random-hero-image'
import GlitchText from './gallery/glitchText'

makeAcronym()
randomHeroImage()

const textToGlitch = document.querySelectorAll('[data-glitch-effect]')
textToGlitch.forEach((elem) => {
    const effect = elem.getAttribute('data-glitch-effect')
    new GlitchText({ element: elem, effect: effect })
})
