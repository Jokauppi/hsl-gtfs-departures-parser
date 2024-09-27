import { parse } from 'csv-parse'
import { createReadStream } from 'node:fs'
import path from 'node:path'
import { finished } from 'node:stream/promises'
import { endTimer, startTimer } from '../timers'

export const loadTrips = async (serviceIds: Set<string>) => {
    startTimer('loadTrips')

    const trips = new Map<string, string[]>()

    const parser = createReadStream(path.join('data', 'trips.txt')).pipe(
        parse()
    )

    parser.on('readable', () => {
        let record
        while ((record = parser.read() as string[]) !== null) {
            if (serviceIds.has(record[1]!)) {
                trips.set(record[2]!, record.slice(0, 4))
            }
        }
    })

    await finished(parser)

    endTimer('loadTrips')

    return trips
}
