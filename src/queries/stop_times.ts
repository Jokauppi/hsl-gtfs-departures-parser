import { parse } from 'csv-parse'
import { createReadStream } from 'node:fs'
import path from 'node:path'
import { finished } from 'node:stream/promises'
import { dayOffset, excludeRoutesFromStop, stopsToInclude } from '../config'
import { endTimer, startTimer } from '../timers'
import { routes } from './routes'
import { type Departure } from './types'
import { vehicleTypes } from './vehicle_types'

export const loadStopTimes = async (
    trips: Map<string, string[]>,
    date: Date
): Promise<Departure[]> => {
    startTimer('loadStopTimes')

    const tripIds = new Set<string>(trips.keys())
    const departures: Departure[] = []
    const now = Date.now() + dayOffset
    const dateTimestamp = date.setHours(0, 0, 0, 0)

    const parser = createReadStream(path.join('data', 'stop_times.txt')).pipe(
        parse()
    )

    parser.on('readable', () => {
        let stop_time
        while ((stop_time = parser.read() as string[]) !== null) {
            const [hours, minutes] = stop_time[2]!.split(':').map(Number)
            const departureTime =
                dateTimestamp + hours! * 60 * 60 * 1000 + minutes! * 60 * 1000

            if (departureTime < now) continue

            if (
                stopsToInclude.has(stop_time[3]!) &&
                tripIds.has(stop_time[0]!)
            ) {
                const trip = trips.get(stop_time[0]!)

                // Some routes stop on multiple stops so only the closest one is relevant
                if (excludeRoutesFromStop[stop_time[3]!]?.includes(trip![0]!))
                    continue

                departures.push({
                    route: routes.get(trip![0]!)!, // route short name
                    vehicleType:
                        vehicleTypes.get(trip![0]!)! ??
                        (parseInt(routes.get(trip![0]!)!) <= 15
                            ? 'tram'
                            : 'bus'), // vehicle type
                    headsign: trip![3]!, // trip headsign
                    time: departureTime, // departure time
                    stopId: stop_time[3]!, // stopId
                    routeId: trip![0]!, // routeId
                    realtime: false,
                })
            }
        }
    })

    await finished(parser)

    endTimer('loadStopTimes')

    return departures
}
