const show_hide_info = () => {

    const infoBox = document.getElementById('info-box');
    const toggleInfoButton = document.getElementById('info');
    if (infoBox != null && info != null) {

        const closeInfoButton = infoBox.getElementsByClassName('close')[0]

        toggleInfoButton.addEventListener('click', function (event) {
            infoBox.classList.toggle('active')
        })

        if (closeInfoButton != null) {
            closeInfoButton.addEventListener('click', function (event) {
                infoBox.classList.remove('active')
            })
        }
    }

}

export default show_hide_info