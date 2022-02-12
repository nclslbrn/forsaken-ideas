const palettes = [
    ['#1b1b3a', '#693668', '#a74482', '#f84aa7'],
    ['#ff6978', '#fffcf9', '#6d435a', '#352d39'],
    ['#003049', '#d62828', '#f77f00', '#fcbf49'],
    ['#fbfef9', '#191923', '#0e79b2', '#bf1363'],
    ['#2b2d42', '#8d99ae', '#edf2f4', '#ef233c'],
    ['#b3001b', '#262626', '#255c99', '#7ea3cc'],
    ['#3f7cac', '#95afba', '#bdc4a7', '#d5e1a3'],
    ['#f9e7e7', '#ded6d6', '#d2cbcb', '#ada0a6'],
    ['#161925', '#23395b', '#406e8e', '#8ea8c3'],
    ['#faf3dd', '#c8d5b9', '#8fc0a9', '#68b0ab'],
    ['#01baef', '#0cbaba', '#380036', '#26081c'],
    ['#dcfffd', '#52ffee', '#4fb477', '#3f6634'],
    ['#f0a202', '#f18805', '#d95d39', '#0e1428'],
    ['#aeb4a9', '#e0c1b3', '#d89a9e', '#c37d92'],
    ['#eee2df', '#eed7c5', '#c89f9c', '#c97c5d'],
    ['#3e5641', '#a24936', '#d36135', '#282b28'],
    ['#6b6d76', '#a69888', '#fcbfb7', '#334e58'],
    ['#331832', '#d81e5b', '#f0544f', '#c6d8d3']
]

export default function () {
    return palettes[Math.floor(Math.random() * palettes.length)]
}
