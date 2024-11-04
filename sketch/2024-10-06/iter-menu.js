import { $compile } from '@thi.ng/rdom'
import { ul, li, para, div, button } from '@thi.ng/hiccup-html'
import { getSavedSeed, removeSeed } from '../../sketch-common/random-seed'

const iterMenu = (ITER_LIST, STATE) => {
    if (ITER_LIST === undefined) return
    ITER_LIST.innerHTML = ''
    const saved = getSavedSeed()
    $compile(
        div(
            {},
            para(null, 'SEEDS'),
            ul(
                { style: 'list-style: none;' },
                ...saved.map((iter) =>
                    li(
                        {
                            style: 'display: flex; align-items: flex-end; width: 100%; margin-top: 0.25em'
                        },
                        button(
                            {
                                onclick: () => {
                                    window.seed = iter[1]
                                    init()
                                    iterMenu(ITER_LIST, STATE)
                                },
                                style: `
                                padding: 0.25em 0.5em;
                                border: 1px solid #666;
                                border-radius: 0.5em;
                                border-right: none; 
                                border-top-right-radius: 0;
                                border-bottom-right-radius: 0;
                                background: ${iter[1] === window.seed ? '#ffd128' : '#ccc'}; 
                              `
                            },
                            iter[1]
                        ),
                        button(
                            {
                                onclick: () => {
                                    removeSeed(iter[1])
                                    iterMenu(ITER_LIST, STATE)
                                },
                                style: `
                                padding: 0.25em 0.5em;
                                border: 1px solid #666; 
                                border-radius: 0.5em;
                                border-top-left-radius: 0;
                                border-bottom-left-radius: 0;
                            `
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
