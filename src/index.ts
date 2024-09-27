import { createInterface } from 'readline/promises'
import { getNextDepartures } from './queries/departures'

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
})

function loop() {
    const nextDepartures = getNextDepartures()

    nextDepartures.forEach((departure) =>
        // Print the departure information with colors
        {
            const route = `\x1b[${departure.vehicleType === 'tram' ? '30;42' : '37;44'}m ${departure.route} ${' '.repeat(4 - (departure.route?.length ?? 0))}`
            const headsign = `\x1b[30;47m   ${departure.headsign} ${' '.repeat(15 - (departure.headsign?.length ?? 0))}`
            const minutesToDeparture =
                departure.minutesToDeparture < 59
                    ? `~${departure.minutesToDeparture} min${' '.repeat(3 - departure.minutesToDeparture?.toString().length)}`
                    : ' '.repeat(8)
            const departureTime = new Date(departure.time)
                .toLocaleTimeString('fi', {
                    hour: '2-digit',
                    minute: '2-digit',
                })
                .replace('.', ':')
            const stopId = ` ${departure.stopId} `

            console.log(
                `${route}${headsign}${minutesToDeparture}${departureTime} \x1b[0m${stopId}`
            )
        }
    )

    console.log('Press Enter to show next departures, or Ctrl+C to exit.')

    rl.once('line', () => {
        loop() // Call the function again on Enter press
    })
}

loop() // Start the loop
