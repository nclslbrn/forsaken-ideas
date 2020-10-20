import textStock from '../../json/e-m-g-words.json'

const makeAcronym = (acronymElem) => {
    let randomAcronym = ''
    const textStockKey = ['e', 'm', 'g']
    if (acronymElem) {
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

        acronymElem.innerHTML = randomAcronym
    }
}

export default makeAcronym
