import { readFile, writeFile } from 'fs/promises'
import { createInterface } from 'readline/promises'
import { loadCalendar } from './load/calendar'
import { loadCalendarExceptions } from './load/calendar_dates'
import { loadRoutes } from './load/routes'
import { loadStopTimes } from './load/stop_times'
import { loadTrips } from './load/trips'
import { loadVehicleTypes } from './load/vehicle_types'
import { endTimer, startTimer } from './timers'

const departures = await readFile('data/departures.json', 'utf8')
    .then((departures) => {
        console.log('Found departures from file')

        return JSON.parse(departures) as string[][]
    })
    .catch(async () => {
        console.log('Error getting departures from file')

        const stop_times = await loadCalendar()
            .then((serviceIds) => loadCalendarExceptions(serviceIds))
            .then((serviceIds) => loadTrips(serviceIds))
            .then(async (trips) =>
                loadStopTimes(
                    trips,
                    await loadRoutes(),
                    await loadVehicleTypes()
                )
            )
            .then((departures) =>
                departures.sort((a, b) => a[3]!.localeCompare(b[3]!))
            )

        const departuresJSON = JSON.stringify(stop_times, null, 2)
        await writeFile('data/departures.json', departuresJSON, 'utf8')

        return stop_times
    })

console.log('Departures in 24h:', Array.from(departures).length)

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
})

function loop() {
    startTimer('nextDepartures')

    console.log(
        departures.filter((departure) => {
            const time = departure[3]!.split(':')
            const departureDateTime = new Date()
            departureDateTime.setHours(parseInt(time[0]!))
            departureDateTime.setMinutes(parseInt(time[1]!))
            return (
                departureDateTime.valueOf() - Date.now() > 4 * 60 * 1000 &&
                departureDateTime.valueOf() - Date.now() < 30 * 60 * 1000
            )
        })
    )

    endTimer('nextDepartures')

    console.log('Press Enter to show next departures, or Ctrl+C to exit.')

    rl.once('line', () => {
        loop() // Call the function again on Enter press
    })
}

loop() // Start the loop
