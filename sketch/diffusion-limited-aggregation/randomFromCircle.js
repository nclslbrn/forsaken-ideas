/**
 * @typedef props
 * @param {object} props.center
 * @param {number} props.radius
 */

export default function (props) {
    if (typeof props !== Object && props.radius && props.center) {
        const angle = Math.PI * 2 * Math.random()
        return {
            x: props.center.x + props.radius * Math.cos(angle),
            y: props.center.y + props.radius * Math.sin(angle)
        }
    } else {
        console.error(
            'This function must be called with an object wich contains a center and a radius property.'
        )
    }
}
