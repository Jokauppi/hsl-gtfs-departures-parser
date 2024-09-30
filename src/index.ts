import { createInterface } from 'readline/promises'
import { getNextDepartures } from './queries/departures'

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
})

const loop = async () => {
    const nextDepartures = await getNextDepartures()

    nextDepartures.forEach((departure) =>
        // Print the departure information with colors
        {
            const route = `\x1b[37;${departure.vehicleType === 'tram' ? '42' : '44'}m ${departure.route} ${' '.repeat(4 - (departure.route?.length ?? 0))}`
            const headsign = `\x1b[30;47m   ${departure.headsign} ${' '.repeat(15 - (departure.headsign?.length ?? 0))}`
            const minutesToDeparture =
                departure.minutesToDeparture < 59
                    ? `${!departure.realtime ? '\x1b[32~' : ''}${departure.minutesToDeparture} min${' '.repeat(3 - departure.minutesToDeparture?.toString().length)}`
                    : ' '.repeat(8)
            const departureTime =
                '\x1b[30' +
                new Date(departure.time)
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
        void loop() // Call the function again on Enter press
    })
}

await loop() // Start the loop
