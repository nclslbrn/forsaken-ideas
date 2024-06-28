export default (palette) => {
    const notifStyles = Array(
        [`%c██`, `color: ${palette.background}`],
        [`%c██`, `color: ${palette.stroke}`],
        ...palette.colors.map((c) => [`%c██`, `color: ${c}`])
    ).reduce((acc, t) => [`${acc[0]} ${t[0]}`, [...acc[1], t[1]]], ['', []])

    console.log(
        `${notifStyles[0]}`,
        ...notifStyles[1],
        Array.from(Object.keys(palette.meta)).reduce(
            (st, k) =>
                `${st}\r\n ${k[0].toUpperCase()}${k.slice(1)}: ${palette.meta[k]}`,
            ''
        )
    )
}
