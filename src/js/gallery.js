import '../sass/grid-gallery.scss'
// import makeAcronym from './gallery/random-acronym-extend'
// import randomHeroImage from './gallery/random-hero-image'
import GlitchText from './gallery/glitchText'
import randomOpenGraphCover from './gallery/randomOpenGraphCover'
import gridOrder from './gallery/grid-order'

randomOpenGraphCover()
// makeAcronym()
// randomHeroImage()
gridOrder()

const textToGlitch = document.querySelectorAll('[data-glitch-effect]')
textToGlitch.forEach((elem) => {
    const effect = elem.getAttribute('data-glitch-effect')
    new GlitchText({ element: elem, effect: effect })
})
