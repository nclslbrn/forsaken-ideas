const infobox = () => {

    const infoBoxElement = document.getElementById('infobox');

    if (infoBoxElement != null) {
        infoBoxElement.classList.toggle('active')
    }

}
export default infobox