const projectOrder = () => {
    const projectList = document.getElementById('projectsList')
    const orderButtons = document.querySelectorAll('#orderButtons button')

    const parseProjectFromElem = (elem) => {
        return {
            name: elem.getAttribute('data-name'),
            date: elem.getAttribute('data-date'),
            path: elem.getAttribute('data-path')
        }
    }
    const projectLink = (project) => {
        const listElem = document.createElement('li')
        listElem.setAttribute('date-date', project.date)
        listElem.setAttribute('date-name', project.name)
        listElem.setAttribute('date-path', project.path)

        const link = document.createElement('a')
        link.setAttribute('href', `./sketch/${project.path}`)

        const title = document.createElement('h3')
        title.innerHTML = project.name
        const meta = document.createElement('small')
        meta.innerHTML = project.date

        link.appendChild(title)
        link.appendChild(meta)
        listElem.appendChild(link)

        return listElem
    }

    if (projectList !== null && orderButtons !== null) {
        let dateList = {}
        let nameList = []
        const stack = document.querySelectorAll('#projectsList li')
        stack.forEach((elem) => {
            const project = parseProjectFromElem(elem)
            nameList[project.name] = project
            const id = project.date.replaceAll('-', '')
            if (dateList[id] == undefined) {
                dateList[id] = []
            }
            dateList[id].push(project)
        })

        orderButtons.forEach((button) => {
            button.addEventListener('click', (event) => {
                orderButtons.forEach((button) => {
                    button.classList.remove('active')
                })
                projectList.innerHTML = ''
                if (button.getAttribute('data-order') == 'name') {
                    Object.entries(nameList).forEach((name) => {
                        projectList.appendChild(projectLink(name[1]))
                    })
                    button.classList.add('active')
                } else {
                    Object.entries(dateList).forEach((date) => {
                        date[1].forEach((project) => {
                            projectList.appendChild(projectLink(project))
                        })
                    })
                    button.classList.add('active')
                }
            })
        })
    }
}

export default projectOrder
