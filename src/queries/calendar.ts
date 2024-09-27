import { parse } from 'csv-parse'
import { createReadStream } from 'node:fs'
import path from 'node:path'
import { finished } from 'node:stream/promises'
import { endTimer, startTimer } from '../timers'
import { dateFromYYYYMMDD } from '../utils'

export const loadCalendar = async (date: Date) => {
    startTimer('loadCalendar')

    const currentDayOfWeek = ((date.getDay() + 6) % 7) + 1

    const serviceIds = new Set<string>()

    const parser = createReadStream(path.join('data', 'calendar.txt')).pipe(
        parse()
    )

    parser.on('readable', () => {
        let record

        while ((record = parser.read() as string[]) !== null) {
            if (
                record[currentDayOfWeek] === '1' &&
                date >= dateFromYYYYMMDD(record[8] ?? '30000101') &&
                date <= dateFromYYYYMMDD(record[9] ?? '19700101')
            ) {
                serviceIds.add(record[0]!)
            }
        }
    })

    await finished(parser)

    endTimer('loadCalendar')

    return serviceIds
}
