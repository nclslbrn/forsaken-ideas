const getMinMaxPolysPoints = (polys, query, axis) => {
    switch (query) {
        case 'min':
            return polys.reduce(
                (min, poly) =>
                    Math.min(
                        min,
                        ...poly.points.map((p) => p[axis === 'x' ? 0 : 1])
                    ),
                999999
            )
        case 'max':
            return polys.reduce(
                (max, poly) =>
                    Math.max(
                        max,
                        ...poly.points.map((p) => p[axis === 'x' ? 0 : 1])
                    ),
                0
            )
    }
}

export { getMinMaxPolysPoints }
