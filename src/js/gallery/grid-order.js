export default function () {
    window.addEventListener('load', () => {
        const grid = document.getElementById('grid-gallery')
        const activeIndicator = document.getElementById('activeIndicator')
        const sortButton = Array.from(
            document.querySelectorAll('form#orderGrid ul li button')
        )
        const projects = Array.from(
            document.querySelectorAll('ul#grid-gallery > li')
        )
        let topics = projects.reduce((list, project) => {
            if (
                project.getAttribute('data-topic') &&
                !list.includes(project.getAttribute('data-topic'))
            ) {
                list.push(project.getAttribute('data-topic'))
            }
            return list
        }, [])
        topics.sort((a, b) => {
            return a > b ? 1 : -1
        })

        const moveIndicator = (current) => {
            if (!current) {
                activeIndicator.style.left = '0px'
                activeIndicator.style.width = '0px'
            } else {
                activeIndicator.style.left = current.offsetLeft + 'px'
                activeIndicator.style.width = current.offsetWidth + 'px'
            }
        }

        const sublist = (listTitle, items) => {
            const entry = document.createElement('li')
            const title = document.createElement('h2')
            const list = document.createElement('ul')
            title.classList.add('list-title')
            title.innerText = listTitle
            entry.appendChild(title)
            items.forEach((item) => list.appendChild(item))
            entry.appendChild(list)
            grid.appendChild(entry)
        }

        const sortGrid = (order) => {
            grid.innerHTML = ''
            if (order === 'name') {
                let sortedByName = []
                const orderedProject = [...projects].sort(function (a, b) {
                    const aName = a.getAttribute('data-name')
                    const bName = b.getAttribute('data-name')
                    return aName > bName ? 1 : -1
                })
                orderedProject.forEach((p) => {
                    const firstChar = p.getAttribute('data-name').charAt(0)
                    if (undefined === sortedByName[firstChar])
                        sortedByName[firstChar] = []
                    sortedByName[firstChar].push(p)
                })
                for (const char in sortedByName) {
                    sublist(char, sortedByName[char])
                }
            } else if (order === 'date') {
                let sortedByDate = []
                const orderedProject = [...projects].sort(function (a, b) {
                    const aDate = a.getAttribute('data-date')
                    const bDate = b.getAttribute('data-date')
                    return aDate > bDate ? 1 : -1
                })
                orderedProject.forEach((p) => {
                    const dateIndex = p.getAttribute('data-date').slice(0, 7)
                    if (undefined === sortedByDate[dateIndex]) {
                        sortedByDate[dateIndex] = []
                    }
                    sortedByDate[dateIndex].push(p)
                })
                for (const date in sortedByDate) {
                    sublist(date.replace('-', '/'), sortedByDate[date])
                }
            } else if (order === 'topic') {
                let sortedPerTopic = []
                topics.forEach((topic) => {
                    sortedPerTopic[topic] = []
                    projects.forEach((p) => {
                        if (topic === p.getAttribute('data-topic')) {
                            sortedPerTopic[topic].push(p)
                        }
                    })
                })
                for (const topic in sortedPerTopic) {
                    sublist(topic, sortedPerTopic[topic])
                }
            }
        }
        if (undefined !== sortButton && undefined !== projects) {
            const url = new URL(window.location)
            const currentOrder = url.searchParams.get('order')
            if (null !== currentOrder && 'none' !== currentOrder) {
                moveIndicator(
                    sortButton.filter((elem) => elem.value == currentOrder)[0]
                )
                grid.classList.add('sorted')
                sortGrid(currentOrder)
            }

            sortButton.forEach((button) => {
                button.addEventListener('click', (event) => {
                    event.preventDefault()
                    if (button.classList.contains('active')) {
                        grid.innerHTML = ''
                        grid.classList.remove('sorted')
                        button.classList.remove('active')
                        moveIndicator(false)
                        window.history.replaceState(null, null, '?order=none')
                        projects.forEach((p) => grid.appendChild(p))
                    } else {
                        grid.classList.add('sorted')
                        sortButton.forEach((f) => f.classList.remove('active'))
                        button.classList.add('active')
                        moveIndicator(button)
                        window.history.replaceState(
                            null,
                            null,
                            `?order=${button.value}`
                        )
                        sortGrid(button.value)
                    }
                })
            })

            window.onresize = () => {
                const activeButton = sortButton.filter((elem) =>
                    elem.classList.contains('active')
                )[0]
                if (undefined !== activeButton) {
                    moveIndicator(activeButton)
                }
            }
        }
    })
}
