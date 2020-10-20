import style from '../sass/gallery.scss'
import makeAcronym from './home/random-acronym-extend'
import randomHeroImage from './home/random-hero-image'
const acronymElement = document.getElementById('acronym')

if (acronymElement != null) {
    makeAcronym(acronymElement)

    acronymElement.addEventListener('click', function () {
        makeAcronym(acronymElement)
    })
}

randomHeroImage()
