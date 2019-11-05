import style from './../sass/projects-list.scss'
import makeAcronym from './random-acronym-extend'

const acronymElement = document.getElementById('acronym')

if (acronymElement != null) {

    makeAcronym(acronymElement)

    acronymElement.addEventListener('click', function() {

        makeAcronym(acronymElement)

    })
}