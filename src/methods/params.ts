import { type Params, type Sorting } from '@/project.d'

const queryUrlParams = (params: Params): Params => {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const ascParam = urlParams.get('asc')
    const sortingParam = urlParams.get('sorting')

    if (ascParam !== null) {
        params.asc = ascParam === '1'
    }
    if (sortingParam !== null) {
        params.sorting = sortingParam as Sorting
    }
    return params
}
 
const setUrlParams = (params: { [key: string]: string }): void => {
    const url = new URL(window.location.href)
    Object.keys(params).forEach((key) => {
        if (url.searchParams.has(key)) {
            url.searchParams.set(key, String(params[key]))
        } else {
            url.searchParams.append(key, String(params[key]))
        }
    })
    window.history.pushState({ path: url.href }, '', url.href)
}
export { queryUrlParams, setUrlParams }
