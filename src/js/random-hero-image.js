const randomHeroImage = () => {
    const hero = document.getElementById('hero-image')
    const images = [
        'Mondrian-City.2019-10-2_14.34.29--copyright_Nicolas_Lebrun_CC-by-3.0.svg',
        'Vector-field.2020-7-0_14.57.46--copyright_Nicolas_Lebrun_CC-by-3.0.png',
        'Vector-field.2020-7-0_14.54.9--copyright_Nicolas_Lebrun_CC-by-3.0.png',
        'Vector-field.2020-7-0_15.6.39--copyright_Nicolas_Lebrun_CC-by-3.0.png',
        'Clifford-Attractor.2020-7-0_16.24.57--Nicolas_Lebrun.svg',
        'Clifford-Attractor.2020-7-0_16.26.37--Nicolas_Lebrun.svg',
        'Clifford-Attractor.2020-7-0_16.26.28--Nicolas_Lebrun.svg',
        'Clifford-Attractor.2020-7-0_16.26.18--Nicolas_Lebrun.svg'
    ]

    if (hero && images) {
        const imgId = Math.floor(Math.random(1) * images.length)
        const ext = images[imgId].split('.').pop()
        let style

        if (ext == 'png' || ext == 'jpg' || ext == 'gif') {
            style = `background: 50%/contain url(img/${images[imgId]});`
        } else if (ext == 'svg') {
            style = `background: 50%/cover url(img/${images[imgId]});`
        }

        if (style !== null) {
            hero.setAttribute('style', style)
        }
    }
}

export default randomHeroImage
