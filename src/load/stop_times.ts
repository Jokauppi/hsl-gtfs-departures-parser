import { parse } from 'csv-parse'
import { createReadStream } from 'node:fs'
import path from 'node:path'
import { finished } from 'node:stream/promises'
import { stopsToInclude } from '../config'
import { endTimer, startTimer } from '../timers'

export const loadStopTimes = async (
    trips: Map<string, string[]>,
    routes: Map<string, string>,
    vehicleTypes: Map<string, string>
) => {
    startTimer('loadStopTimes')

    const tripIds = new Set<string>(trips.keys())

    const departures: string[][] = []

    const parser = createReadStream(path.join('data', 'stop_times.txt')).pipe(
        parse()
    )

    parser.on('readable', () => {
        let record
        while ((record = parser.read() as string[]) !== null) {
            // console.log('considering route:', record[5])

            if (stopsToInclude.has(record[3]!) && tripIds.has(record[0]!)) {
                const trip = trips.get(record[0]!)
                // console.log('including stop:', trip![3])

                departures.push([
                    routes.get(trip![0]!)!, // route short name
                    vehicleTypes.get(trip![0]!)! ??
                        (parseInt(routes.get(trip![0]!)!) <= 15
                            ? 'tram'
                            : 'bus'), // vehicle type
                    trip![3]!, // trip headsign
                    record[2]!, // departure time
                    record[3]!, // stop id
                ])
            }
        }
    })

    await finished(parser)

    endTimer('loadStopTimes')

    return departures
}
