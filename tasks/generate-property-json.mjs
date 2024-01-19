import { input, confirm } from '@inquirer/prompts'
import fs from 'fs'

const pad = (x) => ('0' + x).slice(-2)

export default async function (path) {
    let props = {}
    const rowLibs = await input({
        message:
            'Library loaded by CDN you can also use files from sketch-common/' +
            '(import something from @common/something) and node_molules (in this case just leave this field empty), ' +
            'use comma if you want to use multiple libs. Avalaible answer (p5, p5.sound or fabric): '
    })

    if (rowLibs.indexOf(',') > -1) {
        props.libs = rowLibs.split(',').map((item) => item.replace(' ', ''))
    } else {
        props.libs = [rowLibs]
    }
    const info = await input({
        message:
            'write a short sketch description, or leave it blank (and we fill it with "TODO") :'
    })

    if (info !== '') {
        props.info = info
    } else {
        props.info = 'TODO'
    }

    const topic = await input({
        message:
            'Topic/theme for this sketch, available topics: ' +
            'Random distribution, Endless Loop, Cellular automata, ' +
            'Strange Attractor, Plane Curve, Random Distribution, ' +
            'Computer vision, Random walk, Line line collision ' +
            'Perlin noise and Unsorted.' +
            'Write one listed above or create a new one: '
    })
    props.topic = topic.replaceAll(' ', '')

    const actionsConcated = await input({
        message:
            'Your sketch can interact with entry of a side menu (present by default). ' +
            'If you want to use it you have to expose a function on the window object (ex: window.init = p5.redraw()). ' +
            'Write here some pair action name=icon name ' +
            '(possible icons are: sync, plus-circle, clock, desktop-download, file-media, share-android & settings), ' +
            'You could had multiple actions separated by a coma (init=sync, download=file-media).'
    })
    let actions = ''
    if (actionsConcated.indexOf('=') > -1) {
        if (actionsConcated.indexOf(',') > -1) {
            actions = actionsConcated
                .split(',')
                .map((item) => item.replace(' ', ''))
        } else {
            actions = [actionsConcated]
        }
        props.action = actions.map((keyValue) => {
            const args = keyValue.split('=')
            return { name: args[0], icon: args[1] }
        })
    } else {
        props.action = []
    }

    const today = new Date()
    props.date =
        today.getFullYear() +
        '-' +
        pad(today.getMonth() + 1) +
        '-' +
        pad(today.getDate())

    console.log(props)
    const rewiewed = await confirm({
        message: 'Does this configuration seem correct ?'
    })

    if (rewiewed) {
        const jsonContent = JSON.stringify(props)
        fs.writeFileSync(
            `${path}/property.json`,
            jsonContent,
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
}
