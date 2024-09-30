import { parse } from 'csv-parse'
import { createReadStream } from 'node:fs'
import path from 'node:path'
import { finished } from 'node:stream/promises'
import { endTimer, startTimer } from '../timers'

const loadVehicleTypes = async () => {
    startTimer('loadVehicleTypes')

    const vehicleTypes = new Map<string, string>()

    const parser = createReadStream(path.join('data', 'emissions.txt')).pipe(
        parse()
    )

    parser.on('readable', () => {
        let record

        while ((record = parser.read() as string[]) !== null) {
            vehicleTypes.set(record[0]!, record[3]!)
        }
    })

    await finished(parser)

    endTimer('loadVehicleTypes')

    return vehicleTypes
}

export const vehicleTypes = await loadVehicleTypes()
