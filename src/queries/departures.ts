import { readFile, writeFile } from 'fs/promises'
import { dayOffset, timeOffset } from '../config'
import { loadCalendar } from './calendar'
import { loadCalendarExceptions } from './calendar_dates'
import { loadRoutes } from './routes'
import { loadStopTimes } from './stop_times'
import { loadTrips } from './trips'
import { type Departure } from './types'
import { loadVehicleTypes } from './vehicle_types'

export const getDepartures = async (): Promise<
    (Omit<Departure, 'time'> & { time: Date })[]
> => {
    const date = new Date(new Date().setHours(0, 0, 0, 0) + dayOffset)

    return await readFile('data/departures.json', 'utf8')
        .then((departures) => {
            console.log('Found departures from file')

            return JSON.parse(departures) as Departure[]
        })
        .catch(async () => {
            console.log('Error getting departures from file')

            const departures = await loadCalendar(date)
                .then((serviceIds) => loadCalendarExceptions(serviceIds, date))
                .then((serviceIds) => loadTrips(serviceIds))
                .then(async (trips) =>
                    loadStopTimes(
                        trips,
                        await loadRoutes(),
                        await loadVehicleTypes(),
                        date
                    )
                )
                .then((departures) =>
                    departures.sort((a, b) => a.time - b.time)
                )

            const departuresJSON = JSON.stringify(departures, null, 2)
            await writeFile('data/departures.json', departuresJSON, 'utf8')

            return departures
        })
        .then((departures) =>
            departures.map((departure) => ({
                ...departure,
                time: new Date(departure.time),
            }))
        )
}

const departures = await getDepartures()

export const getNextDepartures = () => {
    const includedRoutes = new Set<string>()
    return (
        departures
            // Filter departures that are between 4 and 30 minutes away
            .filter(
                (departure) =>
                    departure.time.valueOf() - (Date.now() + timeOffset) >
                        4 * 60 * 1000 &&
                    departure.time.valueOf() - (Date.now() + timeOffset) <
                        6 * 60 * 60 * 1000
            )
            .map((departure) => ({
                ...departure,
                minutesToDeparture: Math.floor(
                    (departure.time.valueOf() - (Date.now() + timeOffset)) /
                        60000
                ),
            }))
            .filter((departure) => {
                // Keep track of included departures to only show the earliest one for each route
                if (
                    includedRoutes.has(`${departure.route} ${departure.stopId}`)
                )
                    return false
                includedRoutes.add(`${departure.route} ${departure.stopId}`)
                return true
            })
    )
}
