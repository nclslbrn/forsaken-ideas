export default function () {
    window.addEventListener('load', () => {
        const filters = Array.from(
            document.querySelectorAll('nav#gridFilter ul li a')
        )

        const grid = document.getElementById('project-capture-grid')
        const projects = Array.from(
            document.querySelectorAll('ul#project-capture-grid > li')
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
        const activeIndicator = document.getElementById('activeIndicator')
        const moveIndicator = (current) => {
            activeIndicator.style.left = current.offsetLeft + 'px'
            activeIndicator.style.width = current.offsetWidth + 'px'
        }

        const sortGrid = (order) => {
            grid.innerHTML = ''
            if (order === 'name') {
                const orderedProject = [...projects].sort(function (a, b) {
                    const aName = a.getAttribute('data-name')
                    const bName = b.getAttribute('data-name')
                    return aName > bName ? 1 : -1
                })
                orderedProject.forEach((project) => grid.appendChild(project))
            } else if (order === 'date') {
                const orderedProject = [...projects].sort(function (a, b) {
                    const aDate = a.getAttribute('data-date')
                    const bDate = b.getAttribute('data-date')
                    return aDate > bDate ? 1 : -1
                })
                orderedProject.forEach((project) => grid.appendChild(project))
            } else if (order === 'topic') {
                const projectPerTopic = []
                topics.forEach((topic, index) => {
                    projectPerTopic.push({
                        title: topic,
                        projects: []
                    })
                })
                projects.forEach((project) => {
                    const projectTopic = project.getAttribute('data-topic')
                    const topicId = topics.indexOf(projectTopic)
                    projectPerTopic[topicId]['projects'].push(project)
                })
                projectPerTopic.forEach((topic) => {
                    //const topicEntry = document.createElement('li')
                    //const projectTopicList = document.createElement('ul')
                    topic['projects'].forEach((project) =>
                        grid.appendChild(project)
                    )
                    /*  topicEntry.innerHTML = `<h2>${topic.title}</h2>`
                    topicEntry.appendChild(projectTopicList)
                    grid.appendChild(topicEntry) */
                })
            }
        }
        if (undefined !== filters && undefined !== projects) {
            const activeFilter = filters.filter((f) =>
                f.classList.contains('active')
            )
            if (activeFilter) moveIndicator(activeFilter[0])

            filters.forEach((filter) => {
                filter.addEventListener('click', (event) => {
                    filters.forEach((f) => f.classList.remove('active'))
                    filter.classList.add('active')
                    moveIndicator(filter)
                    sortGrid(filter.getAttribute('data-orderBy'))
                })
            })
        }
    })
}
