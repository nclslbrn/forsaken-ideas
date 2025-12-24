import { $compile } from '@thi.ng/rdom'
import {
    ul,
    li,
    para,
    div,
    button,
    table,
    thead,
    tbody,
    tr,
    td,
    th
} from '@thi.ng/hiccup-html'
import { getSavedSeed, removeSeed } from '../../sketch-common/random-seed'

const redirectPickedSeed = (seed) => {
    let url = new URL(window.location)
    if (seed) {
        url.searchParams.has('seed')
            ? url.searchParams.set('seed', seed)
            : url.searchParams.append('seed', seed)
    } else if (url.searchParams.has('seed')) {
        url.searchParams.delete('seed')
    }
    url.search = url.searchParams
    url = url.toString()
    window.location = url
}

const iterMenu = (ITER_LIST, STATE) => {
    if (ITER_LIST === undefined) return
    ITER_LIST.innerHTML = ''
    const saved = getSavedSeed()
    const { theme, attractor, operator, shapeName } = STATE
    $compile(
        div(
            {
                style: {
                    maxHeight: '100vh',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                }
            },
            table(
                {},
                thead({}, tr({}, th({}, 'Property'), th({}, 'Value'))),
                tbody(
                    {},
                    tr({}, td({}, 'Theme'), td({}, theme)),
                    tr({}, td({}, 'Attractor'), td({}, attractor)),
                    tr({}, td({}, 'Operate'), td({}, operator)),
                    tr({}, td({}, 'Shape'), td({}, shapeName))
                )
            ),
            para(null, 'SEEDS'),
            ul(
                {},
                li(
                    {},
                    button(
                        { onclick: () => redirectPickedSeed(false) },
                        `⟲ randomize`
                    )
                ),
                ...saved.map((iter) =>
                    li(
                        {},
                        button(
                            {
                                onclick: () => {
                                    redirectPickedSeed(iter[1])
                                },
                                className: `${iter[1] === STATE.seed ? 'current' : ''}`
                            },
                            iter[1].substring(0, 24)
                        ),
                        button(
                            {
                                onclick: () => {
                                    removeSeed(iter[1])
                                    iterMenu(ITER_LIST, STATE)
                                }
                            },
                            '×'
                        )
                    )
                )
            ),
            para(null, `PRESS`),
            ul(
                null,
                ...[
                    `[n] to render a new random edition`,
                    `[s] to save the current seed`,
                    `[c] to clean stored seeds`,
                    `[r] to record a video capture`
                ].map((txt) => li(null, null, null, txt))
            )
        )
    ).mount(ITER_LIST)
}

export { iterMenu }
