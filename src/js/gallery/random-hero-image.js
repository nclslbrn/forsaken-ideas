import images from '../../json/hero-image.json'

const randomHeroImage = () => {
    const hero = document.getElementById('hero-image')

    const randomCover = () => {
        const imgId = Math.floor(Math.random(1) * images.length)
        const style = `background: ${images[imgId].style} url(img/${images[imgId].url});`
        hero.setAttribute('style', style)
    }
    if (hero && images) {
        randomCover()
        const button = document.createElement('button')
        button.innerHTML =
            '<span class="screen-reader-text">Random cover</span><span class="icon">&nesear;</span> image'
        button.classList.add('button')
        hero.appendChild(button)

        button.addEventListener('click', (event) => {
            randomCover()
        })
    }
}

export default randomHeroImage
