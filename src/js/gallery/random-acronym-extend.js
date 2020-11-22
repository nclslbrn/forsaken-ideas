import textStock from '../../json/e-m-g-words.json'
import GlitchText from './glitchText'

const makeAcronym = () => {
    const acronymElement = document.getElementById('acronym')
    const insertRandomAcronym = (acronymElem) => {
        const textStockKey = ['e', 'm', 'g']
        let randomAcronym = ''
        textStockKey.forEach((letter, index) => {
            if (textStock[letter]) {
                let randomWord =
                    textStock[letter][
                        Math.floor(Math.random() * textStock[letter].length)
                    ]
                randomAcronym += randomWord
                if (index !== textStockKey.length - 1) randomAcronym += ' '
            }
        })
        //acronymElem.setAttribute('data-text', randomAcronym)
        acronymElem.innerHTML = randomAcronym
        const d = new GlitchText({
            element: acronymElem,
            effect: 'replace'
        })
    }
    if (acronymElement && textStock) {
        insertRandomAcronym(acronymElement)
        const button = document.createElement('button')
        button.innerHTML =
            '<span class="screen-reader-text">Random acronym</span>' +
            '<span class="icon">&nesear;</span>'

        button.classList.add('button')
        acronymElement.parentNode.appendChild(button)
        acronymElement.parentNode.addEventListener('click', (event) => {
            insertRandomAcronym(acronymElement)
        })
    }
}

export default makeAcronym
