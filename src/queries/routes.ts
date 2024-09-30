import { parse } from 'csv-parse'
import { createReadStream } from 'node:fs'
import path from 'node:path'
import { finished } from 'node:stream/promises'
import { endTimer, startTimer } from '../timers'

const loadRoutes = async () => {
    startTimer('loadRoutes')

    const routes = new Map<string, string>()

    const parser = createReadStream(path.join('data', 'routes.txt')).pipe(
        parse()
    )

    parser.on('readable', () => {
        let record

        while ((record = parser.read() as string[]) !== null) {
            routes.set(record[0]!, record[2]!)
        }
    })

    await finished(parser)

    endTimer('loadRoutes')

    return routes
}

export const routes = await loadRoutes()
