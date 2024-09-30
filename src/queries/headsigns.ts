import { parse } from 'csv-parse'
import { readFile, writeFile } from 'fs/promises'
import { createReadStream } from 'node:fs'
import path from 'node:path'
import { finished } from 'node:stream/promises'
import { endTimer, startTimer } from '../timers'

const loadHeadsigns = async (): Promise<Record<string, string>> =>
    await readFile('data/headsigns.json', 'utf8')
        .then((headsigns) => {
            console.log('Found headsigns from file')

            return JSON.parse(headsigns) as Record<string, string>
        })
        .catch(async () => {
            console.log('Error getting headsigns from file')

            startTimer('loadHeadsigns')

            const headsigns = {} as Record<string, string>
            const gathered = new Set<string>()

            const parser = createReadStream(
                path.join('data', 'trips.txt')
            ).pipe(parse())

            parser.on('readable', () => {
                let record
                while ((record = parser.read() as string[]) !== null) {
                    const routeId = record[0]!
                    const directionId = record[4]!
                    const headsign = record[3]!
                    if (!gathered.has(`${routeId}_${directionId}`)) {
                        gathered.add(`${routeId}_${directionId}`)
                        headsigns[routeId] = headsign
                    }
                }
            })

            await finished(parser)

            endTimer('loadHeadsigns')

            const headsignsJSON = JSON.stringify(headsigns, null, 2)
            await writeFile('data/headsigns.json', headsignsJSON, 'utf8')

            return headsigns
        })

export const headsigns = await loadHeadsigns()
