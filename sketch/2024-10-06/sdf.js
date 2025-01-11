const { abs, max, sqrt } = Math 
/**
 * Return distance from point to a box/rect 
 * @param {Array<Number>} p - [x,y] position of a point
 * @param {Array<Number>} c - [x,y] center of the box
 * @param {Array<Number>} s - [w,h] size of the box 
 * @return Number distance
 */ 
const sdBox = (p, c, s) => {
    const pd = [abs(p[0] - c[0]), abs(p[1] - c[1])]
    const d = [pd[0] - s[0]/2, pd[1] - s[1]/2]
    return sqrt(max(d[0], 0)**2 + max(d[1], 0)**2);
}


export { sdBox }
