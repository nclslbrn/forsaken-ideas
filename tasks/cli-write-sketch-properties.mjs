import fs from 'fs'
import Enquirer from 'enquirer'

const pad = (x) => ('0' + x).slice(-2)
const icons = [
    'sync',
    'plus-circle',
    'clock',
    'desktop-download',
    'file-media',
    'share-android',
    'settings'
]
export default async function (path) {
    // let props = {}
    const questions = [
        {
            name: 'topic',
            type: 'select',
            message:
                'Topic/theme for this sketch, available topics: ' +
                'Write one listed above or create a new one: ',
            choices: [
                'Cellular automata',
                'Computer vision',
                'Endless Loop',
                'Line line collision',
                'Only type',
                'Perlin noise',
                'Plane Curve',
                'Random distribution',
                'Strange Attractor',
                'Random walk',
                'Unsorted'
            ],
            initial: 'Unsorted'
        },
        {
            name: 'libs',
            type: 'select',
            multiple: true,
            message:
                'Library loaded by CDN you can also use files from sketch-common/' +
                'or import something from @common/something in node_molules' +
                '(Use <space> to select, <return> to submit)',
            choices: ['p5', 'p5.sound', 'fabric'].map((c) => ({
                name: c,
                value: c
            }))
        },
        {
            name: 'actions',
            type: 'input',
            message:
                'Your sketch can interact with entry of a side menu (present by default). ' +
                'If you want to use it you have to expose a function on the window object ' +
                'Here is all possible icon' +
                icons.reduce((acc, icon) => `${acc} \n-${icon}`, '') +
                '\nWrite here some pair action name=icon name ' +
                'You could had multiple actions separated by a coma (init=sync, download=file-media).',
            result(input) {
                let out = []
                input
                    .replace(/\s/g, '')
                    .split(',')
                    .map((entry) => {
                        const nameIcon = entry.split('=')
                        out.push({
                            name: nameIcon[0],
                            icon: nameIcon[1]
                        })
                    })
                return out
            }
        }
    ]

    const userInput = await Enquirer.prompt(questions)
    const tod = new Date()
    const props = {
        ...userInput,
        date: `${tod.getFullYear()}-${pad(tod.getMonth() + 1)}-${pad(tod.getDate())}`
    }
    console.log(props)
    fs.writeFileSync(
        `${path}/property.json`,
        JSON.stringify(props),
        'utf-8',
        (err) => {
            if (err) {
                throw new Error(err)
            } else {
                console.log(
                    `Your sketch preset are saved on ${path}/property.json`
                )
            }
        }
    )
}
