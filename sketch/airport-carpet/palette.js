
export default function (i = -1) {
    const palettes = [
        ['#dbcfb0', '#bfc8ad', '#90b494', '#718f94', '#545775'],
        ['#39393a', '#e9d758', '#297373', '#ff8552', '#e6e6e6'],
        ['#006ba6', '#0496ff', '#ffbc42', '#d81159', '#8f2d56'],
        ['#122026', '#8eb8e5', '#7c99b4', '#6b7f82', '#5b5750', '#492c1d'],
        ['#111', '#ee6c4d', '#33312e', '#f38d68', '#662c91', '#17a398'],
        ['#7cea9c', '#55d6be', '#2e5eaa', '#5b4e77', '#593959'],
        ['#5c0029', '#61304b', '#857c8d', '#94bfbe', '#acf7c1'],
        ['#b8d8d8', '#7a9e9f', '#4f6367', '#eef5db', '#fe5f55'],
        ['#183A34', '#00bd9d', '#49c6e5', '#54defd', '#fffbfa', '#8bd7d2']
    ]

    if (i > -1 && i < palettes.length) {
        return palettes[i]
    } else {
        return palettes[Math.floor(Math.random() * palettes.length)]
    }
}
