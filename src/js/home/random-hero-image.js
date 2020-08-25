const randomHeroImage = () => {
    const hero = document.getElementById('hero-image')
    const images = [
        {
            url:
                'Mondrian-City.2019-10-2_14.34.29--copyright_Nicolas_Lebrun_CC-by-3.0.svg',
            style: '50%/cover'
        },
        {
            url:
                'Vector-field.2020-7-0_14.57.46--copyright_Nicolas_Lebrun_CC-by-3.0.png',
            style: '50%/contain'
        },
        {
            url:
                'Vector-field.2020-7-0_14.54.9--copyright_Nicolas_Lebrun_CC-by-3.0.png',
            style: '50%/contain'
        },
        {
            url:
                'Vector-field.2020-7-0_15.6.39--copyright_Nicolas_Lebrun_CC-by-3.0.png',
            style: '50%/contain'
        },
        {
            url: 'Clifford-Attractor.2020-7-0_16.24.57--Nicolas_Lebrun.svg',
            style: '50%/cover'
        },
        {
            url: 'Clifford-Attractor.2020-7-0_16.26.37--Nicolas_Lebrun.svg',
            style: '50%/cover'
        },
        {
            url: 'Clifford-Attractor.2020-7-0_16.26.28--Nicolas_Lebrun.svg',
            style: '50%/cover'
        },
        {
            url: 'Clifford-Attractor.2020-7-0_16.26.18--Nicolas_Lebrun.svg',
            style: '50%/cover'
        },
        {
            url:
                'Noise-landscape.2020-7-3_11.7.44--copyright_Nicolas_Lebrun_CC-by-3.0.png',
            style: '50%/cover'
        },
        {
            url:
                'Noise-landscape.2020-7-3_11.10.23--copyright_Nicolas_Lebrun_CC-by-3.0.png',
            style: '50%/cover'
        },
        {
            url:
                'Moving-light.2020-7-4_16.26.5--copyright_Nicolas_Lebrun_CC-by-3.00.jpg',
            style: '50%/cover'
        }
    ]
    const randomCover = () => {
        const imgId = Math.floor(Math.random(1) * images.length)
        const style = `background: ${images[imgId].style} url(img/${images[imgId].url});`
        hero.setAttribute('style', style)
    }
    if (hero && images) {
        randomCover()
        const button = document.createElement('button')
        button.innerHTML =
            '<span class="screen-reader-text">Random cover</span><span class="icon">&nesear;</span>'
        button.classList.add('button')
        hero.appendChild(button)

        button.addEventListener('click', (event) => {
            randomCover()
        })
    }
}

export default randomHeroImage
