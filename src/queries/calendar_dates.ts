import { parse } from 'csv-parse'
import { createReadStream } from 'node:fs'
import path from 'node:path'
import { finished } from 'node:stream/promises'
import { endTimer, startTimer } from '../timers'

export const loadCalendarExceptions = async (
    serviceIds: Set<string>,
    date: Date
) => {
    startTimer('loadCalendarExceptions')

    const dateStamp =
        date.getFullYear().toString() +
        (date.getMonth() + 1).toString().padStart(2, '0') +
        date.getDate().toString().padStart(2, '0')

    const parser = createReadStream(
        path.join('data', 'calendar_dates.txt')
    ).pipe(parse())

    parser.on('readable', () => {
        let record
        while ((record = parser.read() as string[]) !== null) {
            if (dateStamp === record[1]) {
                if (record[2] === '1') {
                    console.log('Adding service exception:', record[0])
                    serviceIds.add(record[0]!)
                } else if (record[2] === '2') {
                    console.log('Deleting service exception:', record[0])
                    serviceIds.delete(record[0]!)
                }
            }
        }
    })

    await finished(parser)

    endTimer('loadCalendarExceptions')

    return serviceIds
}
