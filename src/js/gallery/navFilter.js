export default function () {
    window.addEventListener('load', () => {
        const filters = Array.from(
            document.querySelectorAll('nav#gridFilter ul li a')
        )
        const grid = document.getElementById('project-capture-grid')
        const projects = Array.from(
            document.querySelectorAll('ul#project-capture-grid > li')
        )
        const activeIndicator = document.getElementById('activeIndicator')
        const moveIndicator = (current) => {
            activeIndicator.style.left = current.offsetLeft + 'px'
            activeIndicator.style.width = current.offsetWidth + 'px'
        }
        const sortGrid = (order) => {
            grid.innerHTML = ''
            let orderedProject
            if (order === 'name') {
                orderedProject = [...projects].sort(function (a, b) {
                    const aName = a.getAttribute('data-name')
                    const bName = b.getAttribute('data-name')
                    return aName > bName ? 1 : -1
                })
            } else if (order === 'date') {
                orderedProject = [...projects].sort(function (a, b) {
                    const aDate = a.getAttribute('data-date')
                    const bDate = b.getAttribute('data-date')
                    return aDate > bDate ? 1 : -1
                })
            } else if (order === 'category') {
                orderedProject = []
            }
            orderedProject.forEach((project) => grid.appendChild(project))
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
