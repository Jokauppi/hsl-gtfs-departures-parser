import GtfsRTBindings from 'gtfs-realtime-bindings'
import { excludeRoutesFromStop, gtfs_rt_url, stopsToInclude } from '../config'
import { endTimer, startTimer } from '../timers'
import { headsigns } from './headsigns'
import { routes } from './routes'
import { type Departure } from './types'
import { vehicleTypes } from './vehicle_types'

export const loadStopTimesRealtime = async (): Promise<Departure[]> => {
    startTimer('loadStopTimesRealtime')

    const departures: Departure[] = []

    await fetch(gtfs_rt_url)
        .then((response) => response.arrayBuffer())
        .then((buffer) =>
            GtfsRTBindings.transit_realtime.FeedMessage.decode(
                new Uint8Array(buffer)
            )
        )
        .then((feed) =>
            feed.entity.forEach(({ tripUpdate }) => {
                const stop = tripUpdate?.stopTimeUpdate?.find(
                    ({ departure, stopId }) =>
                        departure?.uncertainty !== 0 &&
                        stopId &&
                        stopsToInclude.has(stopId) &&
                        !excludeRoutesFromStop[stopId]?.includes(
                            tripUpdate.trip.routeId ?? ''
                        ) &&
                        departure?.time &&
                        departure?.time * 1000 > Date.now()
                )

                const routeId = tripUpdate?.trip.routeId
                const stopId = stop?.stopId
                const time = stop?.departure?.time
                const route = routes.get(routeId ?? '')
                const vehicleType = vehicleTypes.get(routeId ?? '')

                if (stopId && time && routeId && route && vehicleType) {
                    departures.push({
                        routeId,
                        route,
                        vehicleType,
                        headsign: headsigns[routeId] ?? '',
                        stopId,
                        time: time * 1000,
                        realtime: true,
                    })
                }
            })
        )

    endTimer('loadStopTimesRealtime')

    return departures
}
