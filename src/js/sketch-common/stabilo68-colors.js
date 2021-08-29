/**
 * Stabilo pen 68 Arty edition (18 pens colors)
 * More info about theses pens :
 * https://www.stabilo.com/fr/produits/colorier/feutres-de-coloriage/stabilo-pen-68/
 */

const colorsDefs = {
    46: { name: 'Black', value: '#000' },
    95: { name: 'Medium cold gray', value: '#a9c1d0' },
    59: { name: 'Brigth lilac', value: '#bf86b7' },
    58: { name: 'Lilac', value: '#c34bb4' },
    56: { name: 'Rose', value: '#e2447c' },
    19: { name: 'Purple', value: '#973060' },
    48: { name: 'Carmine', value: '#ed404b' },
    45: { name: 'Brown', value: '#a85e3f' },
    54: { name: 'Orange', value: '#ec9543' },
    26: { name: 'Light flesh tint', value: '#f6b9b8' },
    88: { name: 'Light ocre', value: '#e5d47c' },
    44: { name: 'Yellow', value: '#fef05d' },
    24: { name: 'Fluorescent yellow', value: '#fff65c' },
    32: { name: 'Ultramarine', value: '#232f8d' },
    31: { name: 'Fluorescent blue', value: '#005ec7' },
    13: { name: 'Ice green', value: '#5edfe9' },
    51: { name: 'Turquoise blue', value: '#4cbad4' },
    36: { name: 'Emerald green', value: '#5ac061' }
}

// A list of color combination, first key is used to the number of combined colors
const colorsCombinations = {
    2: {
        Sunset: [19, 54],
        'Nordic mist': [95, 19],
        'Swimming Pool': [51, 46],
        'Double blue': [13, 32],
        Mistenta: [95, 58],
        'Bubble Gum': [56, 46],
        Azerty: [46, 24],
        'Vanilla Straberry': [56, 88],
        'Flesh and shadows': [26, 46],
        Fall: [26, 19],
        Toy: [31, 54]
    },
    3: {
        'Sand and sea': [31, 32, 26],
        'Acid toy': [36, 51, 48],
        'Cold nature': [32, 51, 36],
        Basketball: [58, 24, 88],
        'Fluo dream': [13, 44, 26],
        Mondrian: [44, 48, 32]
    },
    4: {
        'Cyan meet tomato': [32, 59, 48, 13],
        'Yellow starship': [44, 95, 46, 24],
        'Sausage and mustard': [51, 48, 44, 26]
    }
}

/**
 * Simple function which returns the list of colors Ids
 * @returns {array} of Ids (int)
 */
const getColorIds = () => {
    const colorIds = Object.keys(colorsDefs)
    return colorIds
}
/**
 * Simple function to return a single colors from colorsDefs
 * @returns {object} color {id, name & value}
 */
const getSingleColors = (colorID = false) => {
    let singleColorId
    if (colorID) {
        singleColorId = colorID
    } else {
        const colorIds = getColorIds()
        const randomColorId =
            colorIds[Math.floor(Math.random() * colorIds.length)]
        singleColorId = randomColorId
    }

    const chooseColor = colorsDefs[singleColorId]
    chooseColor['id'] = singleColorId
    return chooseColor
}
/**
 * Return unique colors from
 * @param {int} colorNum : how many colors you want
 * @returns {array} of colors objects
 */
const getRandomPalette = (colorNum = 1) => {
    const colors = []
    const colorsIds = []

    if (colorNum >= colorsDefs.length) {
        console.log('We only have ', colorsDefs.length - 1, ' colors. Sorry.')
    }

    while (colors.length < colorNum) {
        const newcolors = getSingleColors()
        if (!colorsIds.includes(newcolors.id)) {
            colors.push(newcolors)
        }
    }
    console.log(colors)
    return colors
}
/**
 * Get an array of color from combined colors
 * @param {int|boolean} colorNum the number of returned colors or false if combinationName specified
 * @param {false|String} combinationName false if random,, String if you want a specific combination
 * @returns {array} of colors objects
 */
const getColorCombination = (colorNum = 2, combinationName = false) => {
    let selectedCombination = false
    let selectedCombinationName = null

    // Check if user want multiple colors
    if (colorNum && colorNum < 2) {
        console.error(
            'Color combination means multiple colors (2 colors minimum).'
        )
        return
    }
    // Check if there is combination with the number of colors
    if (colorNum && colorsCombinations[colorNum] === undefined) {
        console.error(
            "Sorry we didn't implemented color combination with ",
            colorNum,
            ' colors.'
        )
        return
    }
    // User want a specific combination
    if (combinationName) {
        for (const [numColor, combinations] of Object.entries(
            colorsCombinations
        )) {
            if (combinations !== undefined) {
                for (const [name, colorsIds] of Object.entries(combinations)) {
                    if (name === combinationName) {
                        selectedCombinationName = combinationName
                        selectedCombination = colorsIds
                    }
                }
            }
        }
    }
    // User want a random combination
    else if (colorsCombinations[colorNum]) {
        const rightColorNumCombinations = Object.keys(
            colorsCombinations[colorNum]
        )
        const randomCombinationNum = Math.floor(
            Math.random() * rightColorNumCombinations.length
        )
        selectedCombinationName =
            rightColorNumCombinations[randomCombinationNum]
        selectedCombination =
            colorsCombinations[colorNum][selectedCombinationName]
    }

    if (selectedCombination && selectedCombinationName) {
        const returnedColors = []
        selectedCombination.forEach((colorId) => {
            returnedColors.push(getSingleColors(colorId))
        })

        return { name: selectedCombinationName, colors: returnedColors }
    } else {
        return false
    }
}

export { getRandomPalette, getColorCombination }
